/**
 * WhatsApp numbers with their country code, so the coach's WhatsApp button always works.
 * The website's phone boxes have a country code picker (components/forms/PhoneInput.tsx);
 * numbers are also cleaned on the server:
 *   withCountryCode("0333 8128133", "PK")  -> "+923338128133"
 *   withCountryCode("7022321731", "IN")    -> "+917022321731"
 *   withCountryCode("919591313539", "IN")  -> "+919591313539"  (code already there, just the + was missing)
 *   withCountryCode("+971 50 268 7261")    -> "+971502687261"
 */

/** Country -> calling code (without +). */
export const CALLING_CODES: Record<string, string> = {
  AF: "93", AL: "355", DZ: "213", AD: "376", AO: "244", AG: "1", AR: "54", AM: "374", AU: "61", AT: "43",
  AZ: "994", BS: "1", BH: "973", BD: "880", BB: "1", BY: "375", BE: "32", BZ: "501", BJ: "229", BT: "975",
  BO: "591", BA: "387", BW: "267", BR: "55", BN: "673", BG: "359", BF: "226", BI: "257", KH: "855", CM: "237",
  CA: "1", CV: "238", CF: "236", TD: "235", CL: "56", CN: "86", CO: "57", KM: "269", CG: "242", CD: "243",
  CR: "506", CI: "225", HR: "385", CU: "53", CY: "357", CZ: "420", DK: "45", DJ: "253", DM: "1", DO: "1",
  EC: "593", EG: "20", SV: "503", GQ: "240", ER: "291", EE: "372", SZ: "268", ET: "251", FJ: "679", FI: "358",
  FR: "33", GA: "241", GM: "220", GE: "995", DE: "49", GH: "233", GR: "30", GD: "1", GT: "502", GN: "224",
  GW: "245", GY: "592", HT: "509", HN: "504", HK: "852", HU: "36", IS: "354", IN: "91", ID: "62", IR: "98",
  IQ: "964", IE: "353", IL: "972", IT: "39", JM: "1", JP: "81", JO: "962", KZ: "7", KE: "254", KI: "686",
  KW: "965", KG: "996", LA: "856", LV: "371", LB: "961", LS: "266", LR: "231", LY: "218", LI: "423", LT: "370",
  LU: "352", MO: "853", MG: "261", MW: "265", MY: "60", MV: "960", ML: "223", MT: "356", MH: "692", MR: "222",
  MU: "230", MX: "52", FM: "691", MD: "373", MC: "377", MN: "976", ME: "382", MA: "212", MZ: "258", MM: "95",
  NA: "264", NR: "674", NP: "977", NL: "31", NZ: "64", NI: "505", NE: "227", NG: "234", KP: "850", MK: "389",
  NO: "47", OM: "968", PK: "92", PW: "680", PS: "970", PA: "507", PG: "675", PY: "595", PE: "51", PH: "63",
  PL: "48", PT: "351", PR: "1", QA: "974", RO: "40", RU: "7", RW: "250", KN: "1", LC: "1", VC: "1",
  WS: "685", SM: "378", ST: "239", SA: "966", SN: "221", RS: "381", SC: "248", SL: "232", SG: "65", SK: "421",
  SI: "386", SB: "677", SO: "252", ZA: "27", KR: "82", SS: "211", ES: "34", LK: "94", SD: "249", SR: "597",
  SE: "46", CH: "41", SY: "963", TW: "886", TJ: "992", TZ: "255", TH: "66", TL: "670", TG: "228", TO: "676",
  TT: "1", TN: "216", TR: "90", TM: "993", TV: "688", UG: "256", UA: "380", AE: "971", GB: "44", US: "1",
  UY: "598", UZ: "998", VU: "678", VE: "58", VN: "84", YE: "967", ZM: "260", ZW: "263",
};

export function withCountryCode(raw: string, country?: string): string {
  const typed = raw.trim();
  const digits = typed.replace(/\D/g, "");
  if (!digits) return typed;
  if (typed.startsWith("+")) return `+${digits}`;
  if (typed.startsWith("00")) return `+${digits.slice(2)}`;
  const code = country ? CALLING_CODES[country.toUpperCase()] : undefined;
  if (!code) return typed;
  if (digits.startsWith(code) && digits.length > 10) return `+${digits}`;
  return `+${code}${digits.replace(/^0+/, "")}`;
}

/** true when the number starts with + (a country code), so a wa.me link works. */
export const hasCountryCode = (phone: string) => phone.trim().startsWith("+");

/** "+923338128133" -> { country: "PK", number: "3338128133" } (for showing a saved number in the phone box). */
export function splitPhone(phone: string): { country: string | null; number: string } {
  const digits = phone.trim().replace(/\D/g, "");
  if (!phone.trim().startsWith("+")) return { country: null, number: phone.trim() };
  // Longest matching code first (e.g. 971 before 97, 1 last); for "1" prefer the US.
  const codes = Object.entries(CALLING_CODES).sort((a, b) => b[1].length - a[1].length || (a[0] === "US" ? -1 : 1));
  const hit = codes.find(([, code]) => digits.startsWith(code));
  return hit ? { country: hit[0], number: digits.slice(hit[1].length) } : { country: null, number: phone.trim() };
}

/**
 * The phone box's value: picked code + typed number. Copes with people typing the code themselves:
 *   ("92", "0300 1234567") -> "+92 3001234567"   ("92", "+92 300 1234567") -> "+923001234567"
 *   ("91", "919591313539") -> "+919591313539"
 */
export function combinePhone(code: string, typed: string): string {
  const t = typed.trim();
  if (!t) return "";
  if (t.startsWith("+") || t.startsWith("00")) return withCountryCode(t);
  const digits = t.replace(/\D/g, "");
  if (digits.startsWith(code) && digits.length > 10) return `+${digits}`;
  return `+${code} ${digits.replace(/^0+/, "")}`;
}
