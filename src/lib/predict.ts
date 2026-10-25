import teamsJson from "@/data/teams.json";
import type { Team } from "./types";

export const TEAMS = (teamsJson.teams as Team[]).slice().sort((a, b) => a.name.localeCompare(b.name));
const H2H = teamsJson.h2h as Record<string, { a: number; d: number; b: number }>;

/** World Cup head-to-head record from the point of view of team `a`. */
export function headToHead(a: string, b: string) {
  const [x, y] = [a, b].sort();
  const r = H2H[`${x}|${y}`];
  if (!r) return { w: 0, d: 0, l: 0 };
  return a === x ? { w: r.a, d: r.d, l: r.b } : { w: r.b, d: r.d, l: r.a };
}

export type Prediction = {
  pA: number; // integer %, pA + pD + pB = 100
  pD: number;
  pB: number;
  winner: "A" | "B" | null; // null = too close to call
  winPct: number;
};

/**
 * Elo ratings (see scripts/build_data.py) -> win/draw/loss probabilities.
 *   E      = 1 / (1 + 10^(-d/400)), d = ratingA - ratingB      (expected score)
 *   P(draw)= 0.28 * exp(-(d/400)^2)                            (draws are likelier between equals)
 *   P(A)   = E - P(draw)/2,  P(B) = 1 - E - P(draw)/2
 */
export function predictMatch(a: Team, b: Team): Prediction {
  const d = a.elo - b.elo;
  const e = 1 / (1 + Math.pow(10, -d / 400));
  const pd = 0.28 * Math.exp(-Math.pow(d / 400, 2));
  let pa = Math.max(0.01, e - pd / 2);
  let pb = Math.max(0.01, 1 - e - pd / 2);
  const sum = pa + pb + pd;
  pa /= sum;
  pb /= sum;
  const raw = [pa * 100, pd / sum * 100, pb * 100];
  // largest-remainder rounding so the three numbers add up to exactly 100
  const floors = raw.map(Math.floor);
  let left = 100 - floors.reduce((s, v) => s + v, 0);
  raw
    .map((v, i) => ({ i, r: v - Math.floor(v) }))
    .sort((x, y) => y.r - x.r)
    .forEach(({ i }) => {
      if (left > 0) {
        floors[i] += 1;
        left -= 1;
      }
    });
  const [pA, pD, pB] = floors;
  const close = Math.abs(pa - pb) < 0.03;
  const winner = close ? null : pa > pb ? "A" : "B";
  return { pA, pD, pB, winner, winPct: Math.max(pA, pB) };
}
