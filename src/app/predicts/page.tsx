"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { TEAMS, headToHead, predictMatch, type Prediction } from "@/lib/predict";
import type { Team } from "@/lib/types";
import { Flag } from "@/components/Flag";

function TeamPicker({
  placeholder,
  value,
  onChange,
  blocked,
}: {
  placeholder: string;
  value: Team | null;
  onChange: (t: Team) => void;
  blocked: string | null;
}) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => !ref.current?.contains(e.target as Node) && setOpen(false);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const list = TEAMS.filter((t) => t.name.toLowerCase().includes(q.trim().toLowerCase()));

  return (
    <div ref={ref} className="relative min-w-0">
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center gap-3 rounded-2xl bg-panel px-4 py-4 text-left text-lg font-bold shadow-lg hover:brightness-125"
      >
        {value ? (
          <Flag code={value.flag} name={value.name} size="md" />
        ) : (
          <span className="h-[30px] w-10 shrink-0 bg-paper" aria-hidden />
        )}
        <span className="min-w-0 flex-1 truncate">{value ? value.name : placeholder}</span>
        <svg aria-hidden viewBox="0 0 20 20" className={`h-4 w-4 shrink-0 transition ${open ? "rotate-180" : ""}`}>
          <path d="M3 7l7 7 7-7" fill="none" stroke="currentColor" strokeWidth="1.8" />
        </svg>
      </button>

      {open && (
        <div className="absolute left-0 right-0 top-full z-30 mt-1 rounded-2xl bg-panel p-3 shadow-2xl ring-1 ring-white/10">
          <input
            autoFocus
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search team…"
            aria-label="Search team"
            className="mb-2 w-full rounded-lg bg-black/30 px-3 py-2 text-sm placeholder:text-white/40"
          />
          <ul role="listbox" className="scroll-thin max-h-72 space-y-0.5 overflow-y-auto pr-1">
            {list.map((t) => {
              const off = t.name === blocked;
              return (
                <li key={t.name} role="option" aria-selected={value?.name === t.name} aria-disabled={off}>
                  <button
                    type="button"
                    disabled={off}
                    onClick={() => {
                      onChange(t);
                      setOpen(false);
                      setQ("");
                    }}
                    className="flex w-full items-center gap-3 rounded-lg px-2 py-1.5 text-left text-sm font-normal hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-35"
                  >
                    <Flag code={t.flag} name={t.name} size="sm" />
                    {t.name}
                  </button>
                </li>
              );
            })}
            {list.length === 0 && <li className="px-2 py-2 text-sm text-white/50">No team found</li>}
          </ul>
        </div>
      )}
    </div>
  );
}

export default function PredictsPage() {
  const [a, setA] = useState<Team | null>(null);
  const [b, setB] = useState<Team | null>(null);
  const [result, setResult] = useState<Prediction | null>(null);

  const pick = (side: "A" | "B") => (t: Team) => {
    setResult(null);
    side === "A" ? setA(t) : setB(t);
  };

  const h2h = useMemo(() => (a && b ? headToHead(a.name, b.name) : null), [a, b]);
  const winner = result && a && b ? (result.winner === "A" ? a : result.winner === "B" ? b : null) : null;

  return (
    <main className="mx-auto max-w-5xl px-4 pt-6">
      <div className="text-center">
        <h1 className="font-display inline-flex items-center gap-3 text-xl font-semibold tracking-wider text-gold">
          <span className="h-px w-8 bg-gold/70" aria-hidden />
          PREDICTS
          <span className="h-px w-8 bg-gold/70" aria-hidden />
        </h1>
        <p className="mx-auto mt-1 max-w-xl text-[11px] leading-snug text-gold">
          AI processing relies solely on predictions and statistical analysis; therefore, inaccuracies may occur. Please
          exercise discretion when using it.
        </p>
      </div>

      <div className="mt-6 grid grid-cols-[1fr_auto_1fr] items-start gap-3 sm:gap-5">
        <TeamPicker placeholder="Select Team" value={a} onChange={pick("A")} blocked={b?.name ?? null} />
        <span className="font-display pt-4 text-2xl font-semibold text-gold">VS</span>
        <TeamPicker placeholder="Select Team" value={b} onChange={pick("B")} blocked={a?.name ?? null} />
      </div>

      {a && b && (
        <div className="mt-4 flex justify-center">
          <button
            onClick={() => setResult(predictMatch(a, b))}
            className="rounded-full bg-gold px-14 py-2 text-sm font-bold tracking-wider text-navy shadow-lg hover:brightness-110"
          >
            PREDICTS RESULT
          </button>
        </div>
      )}

      {result && a && b && h2h && (
        <section aria-live="polite" className="mt-5 rounded-2xl bg-panel p-4 shadow-xl sm:p-5">
          <div className="flex items-center gap-2 border-b border-white/25 pb-2 text-xs text-white/85">
            <Flag code={a.flag} name={a.name} size="xs" /> {a.name}
            <span className="text-white/40">–</span>
            <Flag code={b.flag} name={b.name} size="xs" /> {b.name}
          </div>

          <div className="mt-3 grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm">Result :</p>
              <div className="mt-3 flex items-center gap-3">
                {winner ? (
                  <>
                    <Flag code={winner.flag} name={winner.name} size="lg" />
                    <span className="font-display text-2xl font-semibold leading-tight">{winner.name}</span>
                  </>
                ) : (
                  <span className="font-display text-2xl font-semibold leading-tight">Too close to call</span>
                )}
              </div>
            </div>
            <div>
              <p className="text-sm">Win Rate :</p>
              <p className="font-display mt-3 text-4xl font-semibold text-gold tabular-nums">
                {winner ? `${result.winPct} %` : `${result.pA} – ${result.pB} %`}
              </p>
            </div>
          </div>

          <div className="mt-5">
            <div className="flex h-3 overflow-hidden rounded-full bg-black/30" role="img" aria-label={`${a.name} ${result.pA}%, draw ${result.pD}%, ${b.name} ${result.pB}%`}>
              <div style={{ width: `${result.pA}%` }} className="bg-gold" />
              <div style={{ width: `${result.pD}%` }} className="bg-white/35" />
              <div style={{ width: `${result.pB}%` }} className="bg-sky-400" />
            </div>
            <div className="mt-1.5 flex justify-between text-xs text-white/80">
              <span><span className="mr-1 inline-block h-2 w-2 rounded-full bg-gold" />{a.name} {result.pA}%</span>
              <span><span className="mr-1 inline-block h-2 w-2 rounded-full bg-white/35" />Draw {result.pD}%</span>
              <span><span className="mr-1 inline-block h-2 w-2 rounded-full bg-sky-400" />{b.name} {result.pB}%</span>
            </div>
          </div>

          <dl className="mt-4 grid grid-cols-[auto_1fr_1fr] gap-x-4 gap-y-1 border-t border-white/15 pt-3 text-xs text-white/75">
            <dt />
            <dd className="font-bold">{a.name}</dd>
            <dd className="font-bold">{b.name}</dd>
            <dt>Elo rating</dt>
            <dd className="tabular-nums">{Math.round(a.elo)}</dd>
            <dd className="tabular-nums">{Math.round(b.elo)}</dd>
            <dt>World Cup record (W-D-L)</dt>
            <dd className="tabular-nums">{a.w}-{a.d}-{a.l}</dd>
            <dd className="tabular-nums">{b.w}-{b.d}-{b.l}</dd>
            <dt>World Cup titles</dt>
            <dd>{a.titles}</dd>
            <dd>{b.titles}</dd>
          </dl>
          <p className="mt-3 text-[11px] text-white/55">
            Head-to-head at World Cups: {a.name} {h2h.w} win{h2h.w === 1 ? "" : "s"}, {h2h.d} draw{h2h.d === 1 ? "" : "s"},{" "}
            {b.name} {h2h.l} win{h2h.l === 1 ? "" : "s"}. Model: Elo ratings built from every men’s World Cup match
            1930–2022, converted to win/draw/loss probabilities.
          </p>
        </section>
      )}

      <aside aria-labelledby="disc" className="mt-12 border-t border-gold/40 pt-5 text-sm leading-relaxed text-white/80">
        <h2 id="disc" className="font-display text-lg font-bold text-gold">
          Educational Disclaimer
        </h2>
        <p className="mt-1">
          This website has been created strictly as part of a term project for the Ethics course, with the sole purpose
          of educational study and software development.
        </p>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>
            <strong>No Gambling Endorsement:</strong> We do not support or promote gambling in any form.
          </li>
          <li>
            <strong>No Real-Money System:</strong> This platform operates purely as an analytical and prediction system.
            No real money or any form of monetary value is involved or rewarded.
          </li>
          <li>
            <strong>Data Attribution:</strong> All match schedules, standings, and related tournament data are sourced
            from public domain information for learning purposes. For official information and updates, please visit the
            official FIFA website (
            <a className="underline hover:text-gold" href="https://www.fifa.com" target="_blank" rel="noreferrer">
              www.fifa.com
            </a>
            ).
          </li>
        </ul>
      </aside>
    </main>
  );
}
