"use server";

/**
 * "Replace" on admin > Site photos: uploads a new picture and puts it in ONE place on the website
 * (a banner, a slide, the before/after photos, the About photo, a client result, an e-book cover).
 * Other places that used the old photo keep it. The old photo stays in admin > All photos.
 *
 * `target` says which place, e.g.:
 *   global:page-photos:beforePhoto            one photo field of a settings page
 *   array:homepage:banners:2:photo            row 3 of the homepage banners
 *   doc:testimonials:12:image                 one item of a list page (testimonials, ebooks)
 * Only the places listed in TARGETS can be changed. Only a logged-in admin may use it.
 */
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { getPayloadClient } from "../../lib/payload.server";
import { PHOTO_TARGETS, replacePhotoIn } from "./sitePhotoReplace";

const PHOTO_TYPES = /^image\/(jpeg|png|webp|avif)$/;

type Result = { ok: true } | { ok: false; error: string };

export async function replaceSitePhoto(formData: FormData): Promise<Result> {
  const payload = await getPayloadClient();
  const { user } = await payload.auth({ headers: await headers() });
  if (!user) return { ok: false, error: "Please log in to the admin panel again." };

  const target = String(formData.get("target") ?? "");
  const file = formData.get("file");
  const alt = String(formData.get("alt") ?? "").trim().slice(0, 200) || "Photo";
  if (!PHOTO_TARGETS.some((rule) => rule.test(target))) return { ok: false, error: "This place can't be changed here." };
  if (!(file instanceof File) || file.size === 0) return { ok: false, error: "Please choose a photo." };
  if (!PHOTO_TYPES.test(file.type)) return { ok: false, error: "Please choose a JPG, PNG or WebP photo." };

  const focal = readFocal(formData);
  try {
    const media = await replacePhotoIn(payload, target, { data: Buffer.from(await file.arrayBuffer()), mimetype: file.type, name: file.name, size: file.size }, alt, focal);
    console.log(`[site-photos] ${target} -> new photo ${media.filename}`);
  } catch (error) {
    console.error(`[site-photos] Could not replace ${target}:`, error);
    return { ok: false, error: "The photo couldn't be saved. Please try again, or try a smaller photo." };
  }

  revalidatePath("/admin/site-photos");
  return { ok: true };
}

/** focalX / focalY from the form (0-100), or undefined. */
function readFocal(formData: FormData): { x: number; y: number } | undefined {
  const x = Number(formData.get("focalX"));
  const y = Number(formData.get("focalY"));
  if (!Number.isFinite(x) || !Number.isFinite(y) || formData.get("focalX") === null) return undefined;
  return { x: Math.min(100, Math.max(0, x)), y: Math.min(100, Math.max(0, y)) };
}

/** "Adjust position" on admin > Site photos: moves a photo that is already there (no new upload). */
export async function setPhotoPosition(formData: FormData): Promise<Result> {
  const payload = await getPayloadClient();
  const { user } = await payload.auth({ headers: await headers() });
  if (!user) return { ok: false, error: "Please log in to the admin panel again." };
  const mediaId = Number(formData.get("mediaId"));
  const focal = readFocal(formData);
  if (!mediaId || !focal) return { ok: false, error: "Something is missing. Please try again." };
  try {
    await payload.update({ collection: "media", id: mediaId, data: { focalX: focal.x, focalY: focal.y } });
  } catch (error) {
    console.error(`[site-photos] Could not move photo ${mediaId}:`, error);
    return { ok: false, error: "The position couldn't be saved. Please try again." };
  }
  revalidatePath("/admin/site-photos");
  return { ok: true };
}
