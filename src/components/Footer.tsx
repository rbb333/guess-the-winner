"use client";

import { useCookies } from "./CookieConsent";

const link = "underline hover:text-gold";

export function Footer() {
  const { openSettings, pageViews } = useCookies();
  return (
    <footer className="mx-auto mt-14 max-w-5xl px-4 pb-24 text-center text-xs leading-relaxed text-white/55">
      <p>
        Educational project, not affiliated with FIFA. Official information:{" "}
        <a className={link} href="https://www.fifa.com" target="_blank" rel="noreferrer">
          www.fifa.com
        </a>
      </p>
      <p className="mt-2">
        Match and card data 1990–2022: Joshua C. Fjelstul, Ph.D.,{" "}
        <a className={link} href="https://www.github.com/jfjelstul/worldcup" target="_blank" rel="noreferrer">
          The Fjelstul World Cup Database
        </a>
        , © 2023 Joshua C. Fjelstul, Ph.D., licensed under{" "}
        <a
          className={link}
          href="https://creativecommons.org/licenses/by-sa/4.0/legalcode"
          target="_blank"
          rel="noreferrer"
        >
          CC BY-SA 4.0
        </a>
        ; modified (filtered, merged with 2026 data, standings and ratings computed). 2026 results:{" "}
        <a className={link} href="https://github.com/openfootball/worldcup.json" target="_blank" rel="noreferrer">
          openfootball
        </a>{" "}
        (public domain). 2026 Team Conduct Score: fifa.com standings.
      </p>
      <p className="mt-2">
        <button onClick={openSettings} className={link}>
          Cookie settings
        </button>
        {pageViews !== null && <span> · Pages viewed in this browser: {pageViews}</span>}
      </p>
    </footer>
  );
}
