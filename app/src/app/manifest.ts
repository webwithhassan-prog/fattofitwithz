/** /manifest.webmanifest - lets members "Add to home screen" on their phone. */
import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Fat To Fit With Z",
    short_name: "Fat To Fit",
    description: "Online nutrition and fitness coaching for women.",
    start_url: "/dashboard",
    display: "standalone",
    background_color: "#fffbf8",
    theme_color: "#ff65c5",
    icons: [{ src: "/icon.png", sizes: "512x512", type: "image/png" }],
  };
}
