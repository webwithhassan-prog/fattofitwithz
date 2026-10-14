"use client";

/**
 * Shown after a form is submitted: a picture of the answers, a "Save image" button and
 * "Send on WhatsApp".
 *
 * On phones, "Send on WhatsApp" opens the share sheet with the image attached (Web Share API),
 * so she just picks WhatsApp and the coach's chat. Where that isn't supported (most computers),
 * it opens the coach's WhatsApp chat with a message, and she attaches the saved image herself.
 *
 * The image is downloaded once when the panel opens, so the button can share it straight away:
 * browsers only allow sharing / opening a new tab right after a tap, not after a slow download.
 */
import { useEffect, useState } from "react";
import { Download, WhatsAppIcon } from "@/components/ui/Icons";

type Props = {
  /** /api/forms/image?form=...&id=... */
  imageUrl: string;
  fileName: string;
  /** Coach's WhatsApp link without a message, e.g. https://wa.me/19176952569 */
  whatsappUrl: string;
  message: string;
};

export function FormSharePanel({ imageUrl, fileName, whatsappUrl, message }: Props) {
  const [image, setImage] = useState<{ file: File; url: string } | null>(null);
  const [loadFailed, setLoadFailed] = useState(false);
  const [hint, setHint] = useState<string | null>(null);
  const chatUrl = `${whatsappUrl}?text=${encodeURIComponent(message)}`;

  useEffect(() => {
    let objectUrl = "";
    let cancelled = false;
    fetch(imageUrl)
      .then(async (res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const blob = await res.blob();
        if (cancelled) return;
        objectUrl = URL.createObjectURL(blob);
        setImage({ file: new File([blob], fileName, { type: "image/png" }), url: objectUrl });
      })
      .catch((error) => {
        console.warn("[form-share] Could not load the form image:", error);
        if (!cancelled) setLoadFailed(true);
      });
    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [imageUrl, fileName]);

  function openChat() {
    window.open(chatUrl, "_blank", "noopener,noreferrer");
    setHint("WhatsApp is open. Attach the image you saved (tap the paperclip), then send.");
  }

  function shareOnWhatsApp() {
    setHint(null);
    if (image && navigator.canShare?.({ files: [image.file] })) {
      navigator.share({ files: [image.file], text: message }).catch((error) => {
        if (error instanceof DOMException && error.name === "AbortError") return; // she closed the share sheet
        console.warn("[form-share] Sharing the image failed:", error);
        setHint("Couldn't open the share menu. Save the image, then use the WhatsApp link below.");
      });
      return;
    }
    openChat();
  }

  return (
    <div className="rounded-[16px] border border-line bg-blush p-5">
      <p className="font-medium text-brand-dark">Saved. Now send it to your coach:</p>
      {image || loadFailed ? (
        // eslint-disable-next-line @next/next/no-img-element -- generated per member, not a static asset
        <img src={image?.url ?? imageUrl} alt="Picture of your submitted answers" className="mt-4 w-full max-w-[420px] rounded-[12px] border border-line bg-white" />
      ) : (
        <div className="mt-4 grid aspect-[4/5] w-full max-w-[420px] place-items-center rounded-[12px] border border-line bg-white text-sm text-muted">Preparing your image…</div>
      )}
      <div className="mt-4 flex flex-wrap gap-3">
        <a href={image?.url ?? `${imageUrl}&download=1`} download={fileName} className="btn btn-ghost btn-sm">
          <Download className="h-4 w-4" /> Save image
        </a>
        <button type="button" onClick={shareOnWhatsApp} className="btn btn-sm bg-whatsapp hover:bg-[#178a47]">
          <WhatsAppIcon className="h-4.5 w-4.5" /> Send on WhatsApp
        </button>
      </div>
      {hint ? (
        <p role="status" className="mt-3 text-sm text-ink">
          {hint}{" "}
          <a href={chatUrl} target="_blank" rel="noopener noreferrer" className="font-medium text-brand-dark underline">Open WhatsApp chat</a>
        </p>
      ) : null}
    </div>
  );
}
