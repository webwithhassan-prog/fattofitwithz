import type { NextConfig } from "next";
import { withPayload } from "@payloadcms/next/withPayload";

/**
 * Old Shopify URLs -> new URLs (permanent 301 redirects).
 * Keeps links shared on Instagram/WhatsApp working and passes search ranking to the new pages.
 * Full list and reasoning: docs/08-seo-a11y-performance.md section 2.
 */
const SHOPIFY_REDIRECTS: [string, string][] = [
  ["/pages/about-us", "/about"],
  ["/pages/programs", "/programs"],
  ["/pages/how-it-works", "/how-it-works"],
  ["/pages/transformations", "/testimonials"],
  ["/pages/faq", "/faq"],
  ["/pages/contact", "/contact"],
  ["/pages/privacy-policy", "/privacy-policy"],
  ["/policies/privacy-policy", "/privacy-policy"],
  ["/pages/refund-cancellation-freeze-policy", "/refund-policy"],
  ["/pages/terms-services", "/terms"],
  ["/pages/member-dashboard", "/dashboard"],
  ["/pages/desi-weight-loss-recipes", "/programs/total-transformation"],
  ["/pages/data-sharing-opt-out", "/privacy-policy"],
  ["/products/fat-to-fit-basic-plan", "/programs/kickstart"],
  ["/products/fat-to-fit-standard-plan", "/programs/fat-loss"],
  ["/products/fat-to-fit-premium-plan", "/programs/diabetes-control"],
  ["/products/health-concerns-programs", "/programs/health-concerns"],
  ["/products/total-transformation-program", "/programs/total-transformation"],
  ["/products/premium-signature-transformation", "/programs/premium-signature"],
  ["/collections/:path*", "/programs"],
  ["/cart", "/programs"],
  ["/blogs/:path*", "/"],
  ["/account/:path*", "/dashboard"],
  ["/account", "/dashboard"],
];

const nextConfig: NextConfig = {
  async redirects() {
    return SHOPIFY_REDIRECTS.map(([source, destination]) => ({ source, destination, permanent: true }));
  },

  // Basic security headers for every response.
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ];
  },

  images: {
    // Thumbnails of the recorded workout videos come from YouTube.
    remotePatterns: [{ protocol: "https", hostname: "i.ytimg.com" }],
    // Local images: our own files in public/images and photos uploaded in the admin panel.
    localPatterns: [{ pathname: "/images/**" }, { pathname: "/api/media/file/**" }],
  },

  experimental: {
    // The site has two root layouts (website + admin panel), so unknown URLs use
    // src/app/global-not-found.tsx instead of a layout-based 404.
    globalNotFound: true,
  },
};

// withPayload adds what the admin panel needs to build inside this Next.js app.
export default withPayload(nextConfig);
