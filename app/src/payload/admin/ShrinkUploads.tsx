"use client";

/**
 * Shrinks big photos in the browser BEFORE the admin panel uploads them.
 *
 * Why: the live site runs on Netlify, which refuses requests bigger than about 6 MB. The admin then
 * only says "An unknown error occurred". Phone photos are often bigger, so any photo over 1.5 MB or
 * 1800 px is redrawn at max 1800 px (the site never shows them bigger) before Payload sends it.
 *
 * How: listens for "a file was chosen" (file picker) and "a file was dropped" before Payload does,
 * swaps in the smaller file, then lets Payload carry on as normal. Other files are left alone.
 * Added to the admin in src/payload.config.ts (admin.components.providers).
 */
import { useEffect } from "react";

const MAX_SIDE = 1800;
const MAX_BYTES = 1.5 * 1024 * 1024;
const SHRINKABLE = /^image\/(jpeg|png|webp)$/;
const needsShrinking = (file: File) => SHRINKABLE.test(file.type) && file.size > MAX_BYTES;

/** Shrinks one photo (if it is big) in the browser. Also used by the Site photos "Replace" buttons. */
export async function shrink(file: File): Promise<File> {
  if (!needsShrinking(file)) return file;
  try {
    const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" }); // keeps phone photos upright
    const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    canvas.getContext("2d")?.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close();
    // PNGs (logos) stay PNG so transparency is kept; everything else becomes JPEG.
    const type = file.type === "image/png" ? "image/png" : "image/jpeg";
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, type, 0.85));
    if (!blob || blob.size >= file.size) return file;
    const name = type === "image/jpeg" ? file.name.replace(/\.(png|webp|jpe?g)$/i, "") + ".jpg" : file.name;
    console.info(`[admin-upload] ${file.name}: ${(file.size / 1e6).toFixed(1)} MB -> ${(blob.size / 1e6).toFixed(1)} MB`);
    return new File([blob], name, { type, lastModified: Date.now() });
  } catch (error) {
    console.warn("[admin-upload] Could not shrink the photo, uploading the original:", error);
    return file;
  }
}

async function shrinkAll(files: FileList): Promise<DataTransfer> {
  const out = new DataTransfer();
  for (const file of await Promise.all([...files].map(shrink))) out.items.add(file);
  return out;
}

export function ShrinkUploads({ children }: { children?: React.ReactNode }) {
  useEffect(() => {
    // File picker ("Select a file")
    const onChange = (event: Event) => {
      const input = event.target;
      if (!(input instanceof HTMLInputElement) || input.type !== "file" || !event.isTrusted || input.dataset.ftfSkip) return;
      if (![...(input.files ?? [])].some(needsShrinking)) return;
      event.stopImmediatePropagation(); // Payload sees the smaller file instead (below)
      void shrinkAll(input.files!).then((smaller) => {
        input.files = smaller.files;
        input.dispatchEvent(new Event("change", { bubbles: true }));
      });
    };
    // Drag and drop
    const onDrop = (event: DragEvent) => {
      const files = event.dataTransfer?.files;
      if (!event.isTrusted || !files || ![...files].some(needsShrinking)) return;
      event.preventDefault();
      event.stopImmediatePropagation();
      const target = event.target as Element;
      void shrinkAll(files).then((smaller) => {
        target.dispatchEvent(new DragEvent("drop", { bubbles: true, cancelable: true, dataTransfer: smaller }));
      });
    };
    document.addEventListener("change", onChange, true);
    document.addEventListener("drop", onDrop, true);
    return () => {
      document.removeEventListener("change", onChange, true);
      document.removeEventListener("drop", onDrop, true);
    };
  }, []);

  return <>{children}</>;
}
