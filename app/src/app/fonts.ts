/** Blossom fonts. next/font self-hosts them, so no request goes to Google at runtime. */
import { Fraunces, Jost } from "next/font/google";

const fraunces = Fraunces({
  subsets: ["latin"],
  style: ["normal", "italic"],
  variable: "--font-fraunces",
  display: "swap",
});
const jost = Jost({ subsets: ["latin"], variable: "--font-jost", display: "swap" });

/** Put on <html> so CSS can use var(--font-fraunces) and var(--font-jost). */
export const fontVariables = `${fraunces.variable} ${jost.variable}`;
