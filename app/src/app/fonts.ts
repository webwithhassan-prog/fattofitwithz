/**
 * Site fonts. next/font self-hosts them, so no request goes to Google at runtime.
 * - Fraunces: headings (elegant serif, italic for the pink "script" words)
 * - DM Sans: body text, buttons and forms (large letters, easy to read on phones)
 */
import { DM_Sans, Fraunces } from "next/font/google";

const fraunces = Fraunces({
  subsets: ["latin"],
  style: ["normal", "italic"],
  variable: "--font-fraunces",
  display: "swap",
});
const dmSans = DM_Sans({ subsets: ["latin"], variable: "--font-sans", display: "swap" });

/** Put on <html> so CSS can use var(--font-fraunces) and var(--font-sans). */
export const fontVariables = `${fraunces.variable} ${dmSans.variable}`;
