"use client";

/**
 * WhatsApp number box with a country code picker, used by every form on the website
 * (checkout, e-book, sign-up, contact). The picker lists every country A to Z with a search box
 * (type a name, "+92" or "92"). It starts on the visitor's own country (cookie ftf_country, set by the
 * price detection) and can be changed. The form receives one value, e.g. "+92 3001234567",
 * in a hidden input called `name` (default "phone").
 */
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { useClientValue } from "@/components/ui/hooks";
import { allCountries } from "@/lib/countries";
import { CALLING_CODES, combinePhone, splitPhone } from "@/lib/phone";

type Props = {
  id: string;
  name?: string;
  defaultValue?: string;
  required?: boolean;
  className?: string;
  describedBy?: string;
};

function readCountryCookie(): string {
  const match = document.cookie.match(/(?:^|; )ftf_country=([A-Za-z]{2})/);
  return match ? match[1].toUpperCase() : "";
}

export function PhoneInput({ id, name = "phone", defaultValue = "", required, className = "field-input", describedBy }: Props) {
  const saved = splitPhone(defaultValue);
  const detected = useClientValue(readCountryCookie, ""); // "" while the server renders
  const [chosen, setChosen] = useState<string | null>(saved.country);
  const [number, setNumber] = useState(saved.number);
  // Her saved code, else the country she is visiting from (fallback only if that can't be detected)
  const country = chosen ?? (CALLING_CODES[detected] ? detected : "PK");
  const code = CALLING_CODES[country] ?? "92";

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const wrapRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const listId = useId();

  // Every country A to Z (names come from the browser, so the list is built only when it opens)
  const countries = useMemo(
    () => (open ? allCountries().filter((c) => CALLING_CODES[c.code]).sort((a, b) => a.name.localeCompare(b.name)) : []),
    [open],
  );
  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return countries;
    const digits = q.replace(/[^\d]/g, "");
    return countries.filter((c) => c.name.toLowerCase().includes(q) || c.code.toLowerCase() === q || (digits && CALLING_CODES[c.code].startsWith(digits)));
  }, [countries, query]);

  // Close when clicking outside
  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", onDown);
    return () => document.removeEventListener("pointerdown", onDown);
  }, [open]);

  // Keep the highlighted country in view
  useEffect(() => {
    listRef.current?.querySelector<HTMLElement>(`[data-index="${active}"]`)?.scrollIntoView({ block: "nearest" });
  }, [active, open]);

  const openPicker = () => {
    setQuery("");
    setOpen(true);
    setTimeout(() => {
      searchRef.current?.focus();
      const list = allCountries().filter((c) => CALLING_CODES[c.code]).sort((a, b) => a.name.localeCompare(b.name));
      setActive(Math.max(0, list.findIndex((c) => c.code === country)));
    }, 0);
  };
  const pick = (iso: string) => {
    setChosen(iso);
    setOpen(false);
    buttonRef.current?.focus();
  };

  const onSearchKey = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") { e.preventDefault(); setActive((i) => Math.min(i + 1, results.length - 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setActive((i) => Math.max(i - 1, 0)); }
    else if (e.key === "Enter") { e.preventDefault(); if (results[active]) pick(results[active].code); }
    else if (e.key === "Escape" || e.key === "Tab") { if (e.key === "Escape") e.preventDefault(); setOpen(false); if (e.key === "Escape") buttonRef.current?.focus(); }
  };

  return (
    <div ref={wrapRef} className="relative flex gap-2">
      <button
        ref={buttonRef}
        type="button"
        aria-label={`Country code: +${code} (${country}). Change`}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => (open ? setOpen(false) : openPicker())}
        className={`${className} flex w-[104px] flex-none items-center justify-between gap-1 px-3 text-left`}
      >
        <span className="whitespace-nowrap">
          <span className="text-xs font-semibold text-gray-500">{country}</span> +{code}
        </span>
        <svg aria-hidden viewBox="0 0 20 20" className="h-4 w-4 flex-none text-gray-500" fill="currentColor">
          <path d="M5.3 7.3a1 1 0 0 1 1.4 0L10 10.6l3.3-3.3a1 1 0 1 1 1.4 1.4l-4 4a1 1 0 0 1-1.4 0l-4-4a1 1 0 0 1 0-1.4Z" />
        </svg>
      </button>
      <input
        id={id}
        type="tel"
        inputMode="tel"
        autoComplete="tel-national"
        required={required}
        value={number}
        onChange={(e) => setNumber(e.target.value)}
        placeholder="Your number"
        aria-describedby={describedBy}
        className={`${className} min-w-0 flex-1`}
      />
      <input type="hidden" name={name} value={combinePhone(code, number)} />

      {open && (
        <div className="absolute left-0 right-0 top-full z-50 mt-1 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg sm:right-auto sm:w-80">
          <div className="border-b border-gray-100 p-2">
            <input
              ref={searchRef}
              type="search"
              role="combobox"
              aria-label="Search country or code"
              aria-controls={listId}
              aria-expanded
              aria-activedescendant={results[active] ? `${listId}-${results[active].code}` : undefined}
              autoComplete="off"
              value={query}
              onChange={(e) => { setQuery(e.target.value); setActive(0); }}
              onKeyDown={onSearchKey}
              placeholder="Search country or code"
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-base outline-none focus:border-[#FF65C5] sm:text-sm"
            />
          </div>
          <ul ref={listRef} id={listId} role="listbox" aria-label="Country codes" className="max-h-64 overflow-y-auto py-1">
            {results.length === 0 && <li className="px-3 py-2 text-sm text-gray-500">No country found</li>}
            {results.map((c, i) => (
              <li
                key={c.code}
                id={`${listId}-${c.code}`}
                data-index={i}
                role="option"
                aria-selected={c.code === country}
                onPointerDown={(e) => e.preventDefault()}
                onClick={() => pick(c.code)}
                onMouseMove={() => setActive(i)}
                className={`flex cursor-pointer items-center gap-2 px-3 py-2 text-sm ${i === active ? "bg-pink-50" : ""} ${c.code === country ? "font-semibold" : ""}`}
              >
                <span className="min-w-0 flex-1 truncate">{c.name}</span>
                <span className="flex-none text-gray-500">+{CALLING_CODES[c.code]}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
