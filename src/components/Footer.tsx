"use client";

import { useCookies } from "./CookieConsent";

export function Footer() {
  const { openSettings, pageViews } = useCookies();
  return (
    <footer className="mx-auto mt-14 max-w-5xl px-4 pb-24 text-center text-xs text-white/55">
      <p>
        Educational project · Match data:{" "}
        <a
          className="underline hover:text-gold"
          href="https://github.com/jfjelstul/worldcup"
          target="_blank"
          rel="noreferrer"
        >
          The Fjelstul World Cup Database
        </a>{" "}
        (CC BY-SA 4.0) · Official info:{" "}
        <a className="underline hover:text-gold" href="https://www.fifa.com" target="_blank" rel="noreferrer">
          www.fifa.com
        </a>
      </p>
      <p className="mt-2">
        <button onClick={openSettings} className="underline hover:text-gold">
          Cookie settings
        </button>
        {pageViews !== null && <span> · Pages viewed in this browser: {pageViews}</span>}
      </p>
    </footer>
  );
}
