"use client";

import { YEARS, type Year } from "@/lib/data";

type Props = { value: Year; onChange: (y: Year) => void };

/** Pill-shaped year dropdown limited to the 10 most recent World Cups. */
export function YearSelect({ value, onChange }: Props) {
  return (
    <div className="relative inline-block">
      <label htmlFor="year" className="sr-only">
        World Cup year
      </label>
      <select
        id="year"
        value={value}
        onChange={(e) => onChange(Number(e.target.value) as Year)}
        className="pill-outline cursor-pointer appearance-none bg-transparent py-1.5 pl-6 pr-11 text-base text-white"
      >
        {YEARS.map((y) => (
          <option key={y} value={y} className="bg-navy text-white">
            {y}
          </option>
        ))}
      </select>
      <svg
        aria-hidden
        viewBox="0 0 20 20"
        className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white"
      >
        <path d="M3 7l7 7 7-7" fill="none" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    </div>
  );
}
