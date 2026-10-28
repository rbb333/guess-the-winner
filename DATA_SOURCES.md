# Data sources, credits and licences

Guess the Winner is an educational term project (Ethics course). It is not affiliated with or endorsed by FIFA.
For official information visit https://www.fifa.com.

## 1. Data used by the app

| What | Source | Licence | How it is used |
|---|---|---|---|
| Matches, scores, penalties, groups, stages, kick-off times, 1990–2022 (`data/matches.csv`) | The Fjelstul World Cup Database v1.2.0 — https://www.github.com/jfjelstul/worldcup | **CC BY-SA 4.0** | Home page, standings, news recaps, Elo ratings |
| Yellow/red cards, 1990–2022 (`data/bookings.csv`) | same | **CC BY-SA 4.0** | Team Conduct Score (TCS) computed per team |
| All 104 matches of the 2026 World Cup (`data/worldcup2026.json`) | openfootball/worldcup.json — https://github.com/openfootball/worldcup.json | **Public domain / CC0 1.0** | 2026 schedule, results, standings, Elo |
| 2026 group-stage Team Conduct Score (`data/tcs_2026.csv`) | FIFA World Cup 2026 standings page — https://www.fifa.com/en/tournaments/mens/worldcup/canadamexicousa2026/standings | © FIFA (factual figures typed in by hand; no FIFA page content or branding is reproduced) | TCS column for 2026 |
| Soviet Union, Czechoslovakia, Yugoslavia, Serbia & Montenegro | no flag available | – | shown as a code badge, not a flag |

**CC BY-SA attribution (required by the licence).**
Match and card data for 1990–2022: Joshua C. Fjelstul, Ph.D., *The Fjelstul World Cup Database v.1.2.0*, © 2023 Joshua C. Fjelstul, Ph.D.,
licensed under CC BY-SA 4.0 (https://creativecommons.org/licenses/by-sa/4.0/legalcode), https://www.github.com/jfjelstul/worldcup.

**Modifications we made:** restricted to men's tournaments 1990–2022; merged with the 2026 data; changed team names for
successor states (West Germany→Germany, Soviet Union→Russia, Yugoslavia and Serbia & Montenegro→Serbia,
Czechoslovakia→Czech Republic) when computing ratings; computed standings, Team Conduct Scores, Elo ratings and
news text from the records. Because of the **ShareAlike** term, the derived data files in this project
(`src/data/tournaments.json`, `src/data/teams.json`) are also offered under CC BY-SA 4.0.

## 2. Derived by us (no external source)
* Elo ratings and win/draw/loss probabilities (`src/lib/predict.ts`, `scripts/build_data.py`) — standard Elo formula applied to the data above.
* News page text — generated from recorded results, not copied from any publication.

## 3. Used only to double-check results (nothing copied into the app)
* 2026 final (Spain 1–0 Argentina, extra time) — foot-africa.com, outlookindia.com, brut.media, goodmorningamerica.com
* 2026 third-place match (England 6–4 France) — itv.com, wego.com, tovima.com, iol.co.za
* 2026 group-stage records — FIFA standings page above (all 48 teams matched our data)

Searched but not used for any figure: FotMob, ESPN, Squawka, Wikipedia (yellow-card counts there are incomplete and
do not distinguish second yellows, so they cannot give a correct TCS).

## 4. Software (all open source, installed from npm)
| Package | Licence |
|---|---|
| Next.js 16, React 19, React DOM | MIT |
| Tailwind CSS 4, @tailwindcss/postcss, PostCSS | MIT |
| flag-icons 7.6.0 (country flag SVGs, © Panayiotis Lipiridis) | MIT |
| @fontsource/cormorant-garamond (font: The Cormorant Project Authors) | SIL Open Font License 1.1 |
| @fontsource/libre-caslon-text (font: Libre Caslon Project Authors) | SIL Open Font License 1.1 |
| TypeScript 7 | Apache-2.0 |
| Vitest, jsdom, Testing Library, @types/* (development only) | MIT |

Each package's full licence text is in `node_modules/<package>/LICENSE` after `npm install`.

## 5. Licence of this project's own code
No licence file has been chosen yet, so by default all rights are reserved by the author. If you want others to reuse the
code, add a `LICENSE` file (MIT is a common choice for coursework). Note that the data files above keep their own
licences regardless of which code licence is chosen.

## 6. Design
Page layouts follow the wireframes supplied by the project team (F1–F5).
