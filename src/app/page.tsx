"use client";

import { useState } from "react";
import { DEFAULT_YEAR, TOURNAMENTS, formatKickoff, type Year } from "@/lib/data";
import type { Match, Side } from "@/lib/types";
import { Flag } from "@/components/Flag";
import { YearSelect } from "@/components/YearSelect";

function TeamRow({ side, other, showPts }: { side: Side; other: Side; showPts: boolean }) {
  const won = side.s > other.s || (side.s === other.s && (side.pk ?? 0) > (other.pk ?? 0));
  return (
    <div className="flex items-center gap-3">
      <Flag code={side.flag} name={side.name} size="md" />
      <span className={`min-w-0 flex-1 truncate text-sm ${won ? "font-bold text-white" : "text-white/85"}`}>
        {side.name}
      </span>
      <span className="flex w-24 items-baseline justify-end gap-1.5 tabular-nums">
        {side.pk !== null && <span className="text-xs text-gold">({side.pk})</span>}
        <span className={`text-base ${won ? "font-bold" : ""}`}>{side.s}</span>
        {showPts && side.pts !== null && <span className="w-9 text-right text-[11px] text-gold">+{side.pts} pt</span>}
      </span>
    </div>
  );
}

function MatchCard({ m }: { m: Match }) {
  const grp = m.stage === "group stage";
  return (
    <div className="cell">
      <div className="mb-2 flex flex-wrap items-baseline justify-between gap-x-3 text-[13px] text-white/90">
        <span className="tabular-nums">{formatKickoff(m.date, m.time)}</span>
        <span className="text-[11px] text-white/50">
          {grp && `Group ${m.group} · `}
          {m.city}
        </span>
      </div>
      <div className="space-y-2">
        <TeamRow side={m.h} other={m.a} showPts={grp} />
        <TeamRow side={m.a} other={m.h} showPts={grp} />
      </div>
      {m.et && <p className="mt-1.5 text-[11px] text-white/45">After extra time</p>}
    </div>
  );
}

export default function HomePage() {
  const [year, setYear] = useState<Year>(DEFAULT_YEAR);
  const t = TOURNAMENTS[String(year)];

  return (
    <main className="mx-auto max-w-5xl px-4 pt-6">
      <h1 className="font-display text-3xl font-semibold tracking-wide">Match Schedule</h1>
      <div className="mt-2">
        <YearSelect value={year} onChange={setYear} />
      </div>

      <nav aria-label="Stages" className="mt-5 flex flex-wrap gap-2">
        {t.stages.map((s) => (
          <a
            key={s}
            href={`#stage-${s.replace(/\s+/g, "-")}`}
            className="rounded-full border border-white/25 px-3 py-1 text-xs text-white/75 hover:border-gold hover:text-gold"
          >
            {t.stageLabels[s]}
          </a>
        ))}
      </nav>

      {t.stages.map((stage) => {
        const ms = t.matches.filter((m) => m.stage === stage);
        return (
          <section key={stage} id={`stage-${stage.replace(/\s+/g, "-")}`} className="mt-7 scroll-mt-4">
            <div className="mb-3 flex justify-center">
              <h2 className="pill-outline min-w-60 px-8 py-1 text-center text-base">
                {t.stageLabels[stage]} <span className="text-xs text-white/50">({ms.length})</span>
              </h2>
            </div>
            <div className="match-grid bg-panel shadow-xl">
              {ms.map((m) => (
                <MatchCard key={m.id} m={m} />
              ))}
            </div>
          </section>
        );
      })}

      <p className="mt-6 text-xs leading-relaxed text-white/50">
        Kick-off times are local to the stadium. Group-stage “+pt” shows the points earned from that match
        ({t.pointsPerWin} for a win{t.pointsPerWin === 2 ? ", the rule used until 1990" : ""}, 1 for a draw). Numbers in
        brackets are penalty shoot-out scores.
      </p>
    </main>
  );
}
