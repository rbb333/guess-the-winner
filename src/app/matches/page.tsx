"use client";

import { useState } from "react";
import { DEFAULT_YEAR, TOURNAMENTS, type Year } from "@/lib/data";
import { Flag } from "@/components/Flag";
import { YearSelect } from "@/components/YearSelect";

const COLS = ["MATCH", "W", "D", "L", "GF", "GA", "GD", "Pts"] as const;

export default function MatchesPage() {
  const [year, setYear] = useState<Year>(DEFAULT_YEAR);
  const t = TOURNAMENTS[String(year)];

  return (
    <main className="mx-auto max-w-5xl px-4 pt-6">
      <h1 className="font-display text-3xl font-semibold tracking-wide">Teams’ Standing</h1>
      <div className="mt-2">
        <YearSelect value={year} onChange={setYear} />
      </div>

      <div className="scroll-thin mt-5 overflow-x-auto bg-panel p-4 shadow-xl sm:p-6">
        <table className="w-full min-w-[640px] border-collapse text-sm">
          <caption className="sr-only">Overall team standing, {year} FIFA World Cup</caption>
          <thead>
            <tr className="border-b border-white/30 text-left text-[12px] tracking-wider text-white/90">
              <th scope="col" className="w-12 pb-2 font-normal">
                POS.
              </th>
              <th scope="col" className="pb-2 font-normal">
                TEAM
              </th>
              {COLS.map((c) => (
                <th key={c} scope="col" className="w-12 pb-2 text-right font-normal">
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {t.standings.map((r) => (
              <tr key={r.team} className="border-b border-white/5 last:border-0 hover:bg-white/5">
                <td className="py-2 tabular-nums text-white/70">{r.pos}</td>
                <td className="py-2">
                  <span className="flex items-center gap-2.5">
                    <Flag code={r.flag} name={r.team} size="sm" />
                    <span className={r.pos === 1 ? "font-bold text-gold" : ""}>
                      {r.team} (Group {r.group})
                    </span>
                  </span>
                </td>
                <td className="py-2 text-right tabular-nums">{r.mp}</td>
                <td className="py-2 text-right tabular-nums">{r.w}</td>
                <td className="py-2 text-right tabular-nums">{r.d}</td>
                <td className="py-2 text-right tabular-nums">{r.l}</td>
                <td className="py-2 text-right tabular-nums">{r.gf}</td>
                <td className="py-2 text-right tabular-nums">{r.ga}</td>
                <td className="py-2 text-right tabular-nums">{r.gd > 0 ? `+${r.gd}` : r.gd}</td>
                <td className="py-2 text-right font-bold tabular-nums">{r.pts}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-4 text-xs leading-relaxed text-white/50">
        Ranking covers every match of the tournament (group stage and knockout rounds), ordered by points, then goal
        difference, then goals for. Points use that edition’s win value ({t.pointsPerWin} per win, 1 per draw); a match
        decided on penalties counts as a draw, as in FIFA’s own statistics. Group letters come from the group stage.
      </p>
    </main>
  );
}
