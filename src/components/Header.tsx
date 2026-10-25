"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  { href: "/", label: "HOME" },
  { href: "/news", label: "NEWS" },
  { href: "/matches", label: "MATCHES" },
];

export function Header() {
  const path = usePathname();
  const active = (href: string) => (href === "/" ? path === "/" : path.startsWith(href));

  return (
    <header className="site-header">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-x-6 gap-y-3 px-4 py-3">
        <Link href="/" className="font-display text-gold leading-[0.95] tracking-wide" aria-label="Guess the Winner – home">
          <span className="block text-[22px] font-medium">GUESS THE</span>
          <span className="block text-center text-[24px] font-semibold">WINNER</span>
        </Link>

        <nav aria-label="Main" className="flex flex-1 items-center justify-end gap-5 sm:gap-9">
          {NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              aria-current={active(n.href) ? "page" : undefined}
              className={`border-b pb-0.5 text-[13px] tracking-wider sm:text-sm ${
                active(n.href) ? "border-gold text-gold" : "border-transparent text-gold/85 hover:text-gold"
              }`}
            >
              {n.label}
            </Link>
          ))}
          <Link
            href="/predicts"
            aria-current={active("/predicts") ? "page" : undefined}
            className="rounded-full bg-gold px-5 py-2 text-[13px] font-bold tracking-wider text-navy shadow-md transition hover:brightness-110 sm:px-9 sm:text-sm"
          >
            <span className={active("/predicts") ? "border-b-2 border-navy pb-0.5" : ""}>PREDICTS</span>
          </Link>
        </nav>
      </div>
    </header>
  );
}
