/** Floating WhatsApp button with the approved pulse ring (bottom-right on every public page). */
import { whatsappLink } from "@/lib/content";
import { WhatsAppIcon } from "@/components/ui/Icons";

export async function WhatsAppButton() {
  const href = await whatsappLink();
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with us on WhatsApp (opens in a new tab)"
      className="whatsapp-pulse fixed right-[18px] bottom-[calc(18px+env(safe-area-inset-bottom,0px))] z-30 grid h-14 w-14 place-items-center rounded-full bg-whatsapp text-white shadow-[0_12px_26px_-8px_rgba(0,0,0,0.4)]"
    >
      <WhatsAppIcon className="h-7 w-7" />
    </a>
  );
}
