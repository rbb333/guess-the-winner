"use client";

import { useState } from "react";
import { DEFAULT_YEAR, TOURNAMENTS, type Year } from "@/lib/data";
import { Flag } from "@/components/Flag";
import { YearSelect } from "@/components/YearSelect";

export default function NewsPage() {
  const [year, setYear] = useState<Year>(DEFAULT_YEAR);
  const t = TOURNAMENTS[String(year)];

  return (
    <main className="mx-auto max-w-5xl px-4 pt-6">
      <h1 className="font-display text-3xl font-semibold tracking-wide">News About World Cup</h1>
      <div className="mt-2">
        <YearSelect value={year} onChange={setYear} />
      </div>
      <p className="mt-3 text-xs text-white/55">
        Hosted by {t.host}. These stories are written from the tournament’s recorded results; for original press
        coverage visit{" "}
        <a className="underline hover:text-gold" href="https://www.fifa.com" target="_blank" rel="noreferrer">
          www.fifa.com
        </a>
        .
      </p>

      <ul className="mt-5 space-y-4">
        {t.news.map((n) => (
          <li key={n.title}>
            <article className="flex flex-col gap-4 bg-paper p-3 text-[#101522] shadow-lg sm:flex-row">
              <div className="flex h-24 shrink-0 items-center justify-center gap-2 bg-navy sm:w-56">
                {n.flags.map((f, i) => (
                  <Flag key={i} code={f} name="team" size={n.flags.length > 1 ? "md" : "lg"} />
                ))}
              </div>
              <div className="min-w-0">
                <p className="text-[11px] uppercase tracking-widest text-[#8a6a2a]">
                  {n.tag} · {year}
                </p>
                <h2 className="font-display text-xl font-bold leading-tight">{n.title}</h2>
                <p className="mt-1 text-sm leading-relaxed text-[#222a3a]">{n.details}</p>
              </div>
            </article>
          </li>
        ))}
      </ul>
    </main>
  );
}
