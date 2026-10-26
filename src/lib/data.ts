import tournamentsJson from "@/data/tournaments.json";
import type { Tournament } from "./types";

/** The 10 most recent men's World Cups, newest first. */
export const YEARS = [2026, 2022, 2018, 2014, 2010, 2006, 2002, 1998, 1994, 1990] as const;
export type Year = (typeof YEARS)[number];
export const DEFAULT_YEAR: Year = 2026;

export const TOURNAMENTS = tournamentsJson as unknown as Record<string, Tournament>;

/** 2022-11-20 + 19:00  ->  20/11/22 - 19:00 */
export function formatKickoff(date: string, time: string): string {
  const [y, m, d] = date.split("-");
  return `${d}/${m}/${y.slice(2)} - ${time}`;
}
