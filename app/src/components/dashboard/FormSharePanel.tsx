"use client";

/**
 * Shown after a form is submitted: a picture of the answers, a "Save image" button and
 * "Send on WhatsApp".
 *
 * On phones, "Send on WhatsApp" opens the share sheet with the image attached (Web Share API),
 * so she just picks WhatsApp and the coach's chat. Where that isn't supported (most computers),
 * it opens the coach's WhatsApp chat with a message, and she attaches the saved image herself.
 */
import { useState } from "react";
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
  const [hint, setHint] = useState<string | null>(null);
  const [sharing, setSharing] = useState(false);

  async function shareOnWhatsApp() {
    setHint(null);
    setSharing(true);
    try {
      const blob = await (await fetch(imageUrl)).blob();
      const file = new File([blob], fileName, { type: "image/png" });
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], text: message });
        return;
      }
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return; // she closed the share sheet
      console.warn("[form-share] Sharing the image failed, opening WhatsApp instead:", error);
    } finally {
      setSharing(false);
    }
    window.open(`${whatsappUrl}?text=${encodeURIComponent(message)}`, "_blank", "noopener,noreferrer");
    setHint("WhatsApp is open. Attach the image you saved (tap the paperclip), then send.");
  }

  return (
    <div className="rounded-[16px] border border-line bg-blush p-5">
      <p className="font-medium text-brand-dark">Saved. Now send it to your coach:</p>
      {/* eslint-disable-next-line @next/next/no-img-element -- generated per member, not a static asset */}
      <img src={imageUrl} alt="Picture of your submitted answers" className="mt-4 w-full max-w-[420px] rounded-[12px] border border-line bg-white" />
      <div className="mt-4 flex flex-wrap gap-3">
        <a href={`${imageUrl}&download=1`} download={fileName} className="btn btn-ghost btn-sm">
          <Download className="h-4 w-4" /> Save image
        </a>
        <button type="button" onClick={shareOnWhatsApp} disabled={sharing} className="btn btn-sm bg-whatsapp hover:bg-[#178a47]">
          <WhatsAppIcon className="h-4.5 w-4.5" /> {sharing ? "Opening…" : "Send on WhatsApp"}
        </button>
      </div>
      {hint ? <p role="status" className="mt-3 text-sm text-ink">{hint}</p> : null}
    </div>
  );
}
