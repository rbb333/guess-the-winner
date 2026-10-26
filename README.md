# Guess the Winner

FIFA World Cup analysis & prediction web app (Ethics-course term project — educational only).
Pages follow the supplied wireframes: **Home** (schedule by stage), **News**, **Matches** (overall team standing),
**Predicts** (pick two teams → win probability), plus a cookie notice / cookie preferences flow. No login or accounts.

## Stack
Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS 4 · `flag-icons` (bundled SVG flags) ·
Vitest + Testing Library. The data is pre-built JSON, so there is no backend or database; the app is fully static.

## Run
```bash
npm install
npm run dev        # http://localhost:3000
npm run build && npm start
npm test           # 11 UI/behaviour tests
```

## Data
* `data/matches.csv`, `data/bookings.csv` (1930–2022): **The Fjelstul World Cup Database**
  (github.com/jfjelstul/worldcup, CC BY-SA 4.0).
* `data/worldcup2026.json` (all 104 matches of the 2026 World Cup): openfootball/worldcup.json (public domain).
  Final/third-place results were cross-checked against news reports.

`python3 scripts/build_data.py` converts them into `src/data/tournaments.json` (1990–2026 matches, standings, news)
and `src/data/teams.json` (team ratings, records, head-to-head). Re-run it if you change the script.

* Year filter = the 10 most recent men's World Cups: 1990, 1994, 1998, 2002, 2006, 2010, 2014, 2018, 2022, 2026
  (2026 has 48 teams, 12 groups and a Round of 32). Edit `YEARS` in `scripts/build_data.py` and `src/lib/data.ts` to change it.
* Standings (Matches page): all matches of the edition, ranked by Pts → GD → GF. Pts use that edition's rule
  (2 per win until 1990, 3 from 1994). A match decided on penalties counts as a draw (as FIFA does).
* **TCS (Team Conduct Score)** on the Matches page = sum over all matches of FIFA fair-play deductions
  (yellow −1, second yellow −3, direct red −4, yellow + direct red −5), computed from `bookings.csv`.
  For 2026, `data/tcs_2026.csv` holds FIFA's official **group-stage** TCS for all 48 teams (copied from fifa.com standings;
  group records were cross-checked against our match data - all 48 teams match). Knockout-round cards are not included;
  teams left blank in that file show "–". Re-run `python3 scripts/build_data.py` after editing it.
* News: short recaps **generated from the recorded results** (final, semi-finals, records, shoot-outs…), not scraped
  press articles. Swap in a real news source/API later if needed (`news` array per year in `tournaments.json`).
* Soviet Union, Czechoslovakia, Yugoslavia and Serbia & Montenegro have no flag SVG in `flag-icons`, so a code badge is shown.

## Prediction model (`src/lib/predict.ts`)
1. Elo rating per team, built chronologically from **every men's World Cup match 1930–2022**
   (start 1500, K = 40 × goal-difference multiplier; West Germany→Germany, USSR→Russia, Yugoslavia→Serbia, etc.).
2. Expected score `E = 1 / (1 + 10^(-d/400))`, `d` = rating difference.
3. Draw probability `0.28 · exp(-(d/400)²)`; `P(A) = E − P(draw)/2`, `P(B) = 1 − E − P(draw)/2`.
4. The favourite is shown with its win %, together with draw % and both teams' records. If |P(A) − P(B)| < 3 points → "Too close to call".

Limitations: ratings only see World Cup matches (no qualifiers, friendlies or squads), so teams that rarely
qualify are rated on little evidence. It is a teaching model, not betting advice.

## Cookies (`src/components/CookieConsent.tsx`)
Banner on first visit → **I accept for cookies** or **Setting cookies** (Necessary = locked on, Analytical = opt-in toggle).
The choice is stored in the `gtw_consent` cookie (1 year). Analytical cookies only enable a *local* page-view counter in
`localStorage`; nothing is sent anywhere. "Cookie settings" in the footer reopens the dialog.

## Structure
```
data/matches.csv            raw dataset
scripts/build_data.py       CSV -> JSON (standings, news, Elo)
src/app/                    page.tsx (Home) · news · matches · predicts · layout
src/components/             Header · Flag · YearSelect · CookieConsent · Footer
src/lib/                    data.ts · predict.ts · types.ts
tests/app.test.tsx          behaviour tests
```
