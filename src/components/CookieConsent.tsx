"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";

/**
 * Cookie management (no accounts, no login).
 *  - "Necessary" cookies are always on: they only store the consent choice itself.
 *  - "Analytical" cookies are opt-in: when enabled we count page views locally in this
 *    browser (localStorage). Nothing is sent to any server or third party.
 */
type Consent = { necessary: true; analytics: boolean };

const COOKIE = "gtw_consent";
const VIEWS_KEY = "gtw_pageviews";

function readConsent(): Consent | null {
  try {
    const hit = document.cookie.split("; ").find((c) => c.startsWith(COOKIE + "="));
    if (!hit) return null;
    const v = JSON.parse(decodeURIComponent(hit.slice(COOKIE.length + 1)));
    return { necessary: true, analytics: Boolean(v.analytics) };
  } catch {
    return null;
  }
}

function writeConsent(c: Consent) {
  document.cookie = `${COOKIE}=${encodeURIComponent(JSON.stringify(c))}; path=/; max-age=31536000; SameSite=Lax`;
}

type Ctx = { openSettings: () => void; analytics: boolean; pageViews: number | null };
const CookieCtx = createContext<Ctx>({ openSettings: () => {}, analytics: false, pageViews: null });
export const useCookies = () => useContext(CookieCtx);

export function CookieProvider({ children }: { children: ReactNode }) {
  const path = usePathname();
  const [ready, setReady] = useState(false);
  const [consent, setConsent] = useState<Consent | null>(null);
  const [panel, setPanel] = useState(false);
  const [draftAnalytics, setDraftAnalytics] = useState(false);
  const [pageViews, setPageViews] = useState<number | null>(null);

  useEffect(() => {
    setConsent(readConsent());
    setReady(true);
  }, []);

  // analytical cookies: local page-view counter, only when the visitor opted in
  useEffect(() => {
    if (!ready) return;
    if (consent?.analytics) {
      try {
        const n = Number(localStorage.getItem(VIEWS_KEY) ?? "0") + 1;
        localStorage.setItem(VIEWS_KEY, String(n));
        setPageViews(n);
      } catch {
        setPageViews(null);
      }
    } else {
      setPageViews(null);
      try {
        localStorage.removeItem(VIEWS_KEY);
      } catch {}
    }
  }, [ready, consent?.analytics, path]);

  const save = useCallback((c: Consent) => {
    writeConsent(c);
    setConsent(c);
    setPanel(false);
  }, []);

  const openSettings = useCallback(() => {
    setDraftAnalytics(readConsent()?.analytics ?? false);
    setPanel(true);
  }, []);

  useEffect(() => {
    if (!panel) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setPanel(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [panel]);

  const value = useMemo(
    () => ({ openSettings, analytics: Boolean(consent?.analytics), pageViews }),
    [openSettings, consent?.analytics, pageViews],
  );

  const showBanner = ready && consent === null;

  return (
    <CookieCtx.Provider value={value}>
      {children}

      {showBanner && (
        <div
          role="region"
          aria-label="Cookie notice"
          className="fixed inset-x-0 bottom-0 z-40 mx-auto flex max-w-5xl flex-col gap-3 bg-paper p-4 text-[#111] shadow-2xl sm:flex-row sm:items-center sm:gap-6"
        >
          <div className="flex flex-1 items-start gap-3">
            <svg aria-hidden viewBox="0 0 24 24" className="mt-0.5 h-7 w-7 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M21 12.5A9 9 0 1111.5 3 4 4 0 0021 12.5z" />
              <circle cx="8.5" cy="10" r="1" fill="currentColor" />
              <circle cx="12" cy="15" r="1" fill="currentColor" />
              <circle cx="16" cy="13" r="1" fill="currentColor" />
            </svg>
            <div>
              <p className="text-[15px] font-bold">Our website is using cookies</p>
              <p className="text-[11.5px] leading-snug text-[#222]">
                We use cookies to ensure that our website works correctly (necessary cookies) and to collect usage
                statistics such as the number of visitors and pages viewed (analytics cookies)
              </p>
            </div>
          </div>
          <div className="flex shrink-0 flex-col gap-2 sm:w-64">
            <button
              onClick={() => save({ necessary: true, analytics: true })}
              className="bg-navy px-4 py-2 text-sm text-gold ring-1 ring-black hover:brightness-125"
            >
              I accept for cookies
            </button>
            <button onClick={openSettings} className="bg-white px-4 py-2 text-sm text-[#111] ring-1 ring-black hover:bg-neutral-100">
              Setting cookies
            </button>
          </div>
        </div>
      )}

      {panel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 p-4" onClick={() => setPanel(false)}>
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="cookie-title"
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md bg-paper p-5 text-[#111] shadow-2xl"
          >
            <h2 id="cookie-title" className="text-lg font-bold">
              Cookie Preferences
            </h2>
            <p className="text-[11px] text-[#555]">Customize your cookie settings as follows:</p>

            <ol className="mt-3 space-y-3 text-sm">
              <li className="flex items-start justify-between gap-4">
                <span>1. Necessary Cookies</span>
                <Toggle checked disabled label="Necessary cookies (always on)" />
              </li>
              <li className="flex items-start justify-between gap-4">
                <span>
                  2. Analytical Cookies : Collect statistics on website usage, such as the number of visitors, to analyze
                  and improve the website.
                </span>
                <Toggle checked={draftAnalytics} onChange={setDraftAnalytics} label="Analytical cookies" />
              </li>
            </ol>

            <div className="mt-5 flex justify-end gap-2">
              <button onClick={() => setPanel(false)} className="bg-white px-4 py-1.5 text-sm ring-1 ring-black hover:bg-neutral-100">
                Cancel
              </button>
              <button
                onClick={() => save({ necessary: true, analytics: draftAnalytics })}
                className="bg-navy px-4 py-1.5 text-sm text-gold ring-1 ring-black hover:brightness-125"
              >
                Save preferences
              </button>
            </div>
          </div>
        </div>
      )}
    </CookieCtx.Provider>
  );
}

function Toggle({
  checked,
  disabled,
  onChange,
  label,
}: {
  checked: boolean;
  disabled?: boolean;
  onChange?: (v: boolean) => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange?.(!checked)}
      className={`relative mt-0.5 h-5 w-11 shrink-0 rounded-full transition ${
        checked ? "bg-navy" : "bg-neutral-400"
      } ${disabled ? "cursor-not-allowed opacity-80" : "cursor-pointer"}`}
    >
      <span
        className={`absolute top-0.5 h-4 w-4 rounded-full transition-all ${
          checked ? "left-[26px] bg-gold" : "left-0.5 bg-white"
        }`}
      />
    </button>
  );
}
