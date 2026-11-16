/**
 * Logos of the ways to pay in Pakistan (uploaded in admin > Website > Payment details).
 * Where no logo is uploaded, a simple icon + name is shown instead. Used on /checkout and the order page.
 */
import Image from "next/image";
import { Bank, Phone } from "@/components/ui/Icons";
import type { PaymentLogo } from "@/lib/types";

export type PayMethods = {
  bank: { enabled: boolean; bankName: string; logo: PaymentLogo | null };
  wallet: { enabled: boolean; logos: PaymentLogo[] };
};

const badge = "inline-flex h-11 items-center gap-2 rounded-[10px] border border-line bg-white px-3 text-sm font-medium text-ink";

function Logo({ logo }: { logo: PaymentLogo }) {
  return <Image src={logo.src} alt={logo.alt} width={logo.width} height={logo.height} className="h-7 w-auto max-w-[120px] object-contain" />;
}

/** One badge: the logo, or an icon with the name. */
export function MethodBadge({ logo, icon, name }: { logo: PaymentLogo | null; icon: "bank" | "phone"; name: string }) {
  return (
    <span className={badge}>
      {logo ? (
        <Logo logo={logo} />
      ) : (
        <>
          {icon === "bank" ? <Bank className="h-5 w-5 text-brand-dark" /> : <Phone className="h-5 w-5 text-brand-dark" />}
          {name}
        </>
      )}
    </span>
  );
}

/** All enabled methods in a row: bank, then JazzCash / Easypaisa. */
export function PaymentMethodBadges({ methods, className = "" }: { methods: PayMethods; className?: string }) {
  const { bank, wallet } = methods;
  if (!bank.enabled && !wallet.enabled) return null;
  return (
    <div className={`flex flex-wrap items-center gap-2 ${className}`}>
      {bank.enabled ? <MethodBadge logo={bank.logo} icon="bank" name={bank.bankName || "Bank transfer"} /> : null}
      {wallet.enabled
        ? wallet.logos.length
          ? wallet.logos.map((logo) => (
              <span key={logo.src} className={badge}>
                <Logo logo={logo} />
              </span>
            ))
          : <MethodBadge logo={null} icon="phone" name="JazzCash / Easypaisa" />
        : null}
    </div>
  );
}
