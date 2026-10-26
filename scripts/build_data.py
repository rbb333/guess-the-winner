#!/usr/bin/env python3
"""Build JSON used by the app from the open World Cup dataset
(Joshua C. Fjelstul, "The Fjelstul World Cup Database", CC-BY-SA 4.0).

Run:  python3 scripts/build_data.py
Out:  src/data/tournaments.json, src/data/teams.json

Sources: data/matches.csv + data/bookings.csv (Fjelstul, 1930-2022, CC BY-SA 4.0) and
data/worldcup2026.json (openfootball/worldcup.json, public domain).
"""
import csv, json, math, os
from datetime import date as _date
from collections import defaultdict, Counter

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
YEARS = [1990, 1994, 1998, 2002, 2006, 2010, 2014, 2018, 2022, 2026]  # 10 most recent editions

# successor names so Elo carries over between political changes
SUCCESSOR = {
    "West Germany": "Germany",
    "Soviet Union": "Russia",
    "Yugoslavia": "Serbia",
    "Serbia and Montenegro": "Serbia",
    "Czechoslovakia": "Czech Republic",
    "Zaire": "DR Congo",
    "Dutch East Indies": "Indonesia",
}

# ISO 3166 / flag-icons codes. Defunct states with no flag-icons SVG are left
# empty so the UI shows a team-code badge instead of a wrong flag.
FLAG = {
    "Algeria": "dz", "Angola": "ao", "Argentina": "ar", "Australia": "au", "Austria": "at",
    "Belgium": "be", "Bolivia": "bo", "Bosnia and Herzegovina": "ba", "Brazil": "br",
    "Bulgaria": "bg", "Cameroon": "cm", "Canada": "ca", "Chile": "cl", "China": "cn",
    "Colombia": "co", "Costa Rica": "cr", "Croatia": "hr", "Czech Republic": "cz",
    "Czechoslovakia": "", "Denmark": "dk", "Ecuador": "ec", "Egypt": "eg",
    "England": "gb-eng", "France": "fr", "Germany": "de", "Ghana": "gh", "Greece": "gr",
    "Honduras": "hn", "Hungary": "hu", "Iceland": "is", "Iran": "ir", "Iraq": "iq",
    "Italy": "it", "Ivory Coast": "ci", "Jamaica": "jm", "Japan": "jp", "Mexico": "mx",
    "Morocco": "ma", "Netherlands": "nl", "New Zealand": "nz", "Nigeria": "ng",
    "North Korea": "kp", "Northern Ireland": "gb-nir", "Norway": "no", "Panama": "pa",
    "Paraguay": "py", "Peru": "pe", "Poland": "pl", "Portugal": "pt", "Qatar": "qa",
    "Republic of Ireland": "ie", "Romania": "ro", "Russia": "ru", "Saudi Arabia": "sa",
    "Scotland": "gb-sct", "Senegal": "sn", "Serbia": "rs", "Serbia and Montenegro": "",
    "Slovakia": "sk", "Slovenia": "si", "South Africa": "za", "South Korea": "kr",
    "Soviet Union": "", "Spain": "es", "Sweden": "se", "Switzerland": "ch", "Togo": "tg",
    "Trinidad and Tobago": "tt", "Tunisia": "tn", "Turkey": "tr", "Ukraine": "ua",
    "United Arab Emirates": "ae", "United States": "us", "Uruguay": "uy", "Wales": "gb-wls",
    "West Germany": "de", "Yugoslavia": "", "DR Congo": "cd", "Indonesia": "id",
    "Cuba": "cu", "Israel": "il", "Kuwait": "kw", "East Germany": "dd", "Haiti": "ht",
    "El Salvador": "sv", "Cape Verde": "cv", "Curaçao": "cw", "Jordan": "jo", "Uzbekistan": "uz", "Zaire": "cd", "Dutch East Indies": "id",
}

STAGE_ORDER = ["group stage", "round of 32", "round of 16", "quarter-finals", "semi-finals",
               "third-place match", "final"]
STAGE_LABEL = {
    "group stage": "Group Stage", "round of 32": "Round of 32", "round of 16": "Round of 16",
    "quarter-finals": "Quarter-finals", "semi-finals": "Semi-finals",
    "third-place match": "3rd Place Play-off", "final": "Final",
}


def i(x):
    return int(x) if x not in ("", None) else 0


def pretty_date(iso):
    d = _date.fromisoformat(iso)
    return f"{d.day} {d.strftime('%B %Y')}"


def points_rule(year):
    # 2 points for a win until 1990, 3 points from 1994
    return 2 if year < 1994 else 3


NAME2026 = {"Bosnia & Herzegovina": "Bosnia and Herzegovina", "USA": "United States"}
STAGE2026 = {"Round of 32": "round of 32", "Round of 16": "round of 16", "Quarter-final": "quarter-finals",
             "Semi-final": "semi-finals", "Match for third place": "third-place match", "Final": "final"}


def load_2026():
    """openfootball 2026 JSON -> rows shaped like Fjelstul's matches.csv.
    'ft' = score after 90 min, 'et' = cumulative score after extra time, 'p' = shoot-out."""
    with open(os.path.join(ROOT, "data", "worldcup2026.json"), encoding="utf-8") as f:
        data = json.load(f)
    out = []
    for idx, m in enumerate(data["matches"], 1):
        sc = m["score"]
        hs, as_ = sc.get("et") or sc["ft"]
        pk = sc.get("p")
        h = NAME2026.get(m["team1"], m["team1"])
        a = NAME2026.get(m["team2"], m["team2"])
        hw = hs > as_ or (hs == as_ and pk and pk[0] > pk[1])
        aw = as_ > hs or (hs == as_ and pk and pk[1] > pk[0])
        grp = m["round"].startswith("Matchday")
        out.append({
            "tournament_id": "WC-2026", "tournament_name": "2026 FIFA Men's World Cup",
            "match_id": f"M-2026-{m.get('num', idx):03d}",
            "stage_name": "group stage" if grp else STAGE2026[m["round"]],
            "group_name": m.get("group", "not applicable") if grp else "not applicable",
            "match_date": m["date"], "match_time": m["time"].split()[0],  # local kick-off
            "stadium_name": "", "city_name": m["ground"], "country_name": "",
            "home_team_name": h, "home_team_code": h[:3].upper(),
            "away_team_name": a, "away_team_code": a[:3].upper(),
            "home_team_score": str(hs), "away_team_score": str(as_),
            "extra_time": "1" if "et" in sc else "0",
            "penalty_shootout": "1" if pk else "0",
            "home_team_score_penalties": str(pk[0]) if pk else "0",
            "away_team_score_penalties": str(pk[1]) if pk else "0",
            "home_team_win": "1" if hw else "0", "away_team_win": "1" if aw else "0",
        })
    return out


TEAM_ALIAS = {"Turkiye": "Turkey", "Türkiye": "Turkey", "Czechia": "Czech Republic"}


def load_tcs_2026():
    """Optional data/tcs_2026.csv (columns: team,tcs). Blank tcs cells are ignored, so the
    template can be filled in gradually. Use FIFA's official team conduct scores (negative or 0)."""
    path = os.path.join(ROOT, "data", "tcs_2026.csv")
    out = {}
    if not os.path.exists(path):
        return out
    with open(path, encoding="utf-8-sig") as f:
        for r in csv.DictReader(f):
            v = (r.get("tcs") or "").strip().replace("\u2212", "-")
            if not v:
                continue
            name = r["team"].strip()
            name = NAME2026.get(name, TEAM_ALIAS.get(name, name))
            out[name] = int(v)
    return out


def team_conduct_scores():
    """FIFA Team Conduct Score per (year, team) from Fjelstul bookings (men's, 1930-2022).
    Per player per match: yellow -1 | second yellow (indirect red) -3 | direct red -4 |
    yellow then direct red -5. Higher (closer to 0) = fairer."""
    per_player = defaultdict(list)
    with open(os.path.join(ROOT, "data", "bookings.csv"), encoding="utf-8") as f:
        for r in csv.DictReader(f):
            if "Men's" not in r["tournament_name"]:
                continue
            per_player[(int(r["tournament_name"][:4]), r["team_name"], r["match_id"], r["player_id"])].append(
                (r["yellow_card"] == "1", r["red_card"] == "1", r["second_yellow_card"] == "1"))
    tcs = defaultdict(int)
    for (year, team, _m, _p), flags in per_player.items():
        second = any(sy for _, _, sy in flags)
        red = any(rd for _, rd, _ in flags)
        yellow_alone = any(y and not rd and not sy for y, rd, sy in flags)
        yellow_and_red = any(y and rd for y, rd, _ in flags)
        if second:
            pts = -3
        elif red:
            pts = -5 if (yellow_alone or yellow_and_red) else -4
        else:
            pts = -1
        tcs[(year, team)] += pts
    return tcs


def main():
    with open(os.path.join(ROOT, "data", "matches.csv"), encoding="utf-8") as f:
        rows = list(csv.DictReader(f))
    mens = [r for r in rows if "Men's" in r["tournament_name"]] + load_2026()
    tcs = team_conduct_scores()
    tcs26 = load_tcs_2026()
    mens.sort(key=lambda r: (r["match_date"], r["match_time"], r["match_id"]))

    # ---------- Elo over every men's World Cup match (1930-2022)
    elo = defaultdict(lambda: 1500.0)
    played = Counter()
    rec = defaultdict(lambda: dict(w=0, d=0, l=0, gf=0, ga=0))
    titles = Counter()
    last_year = {}
    h2h = defaultdict(lambda: dict(a=0, d=0, b=0))
    for r in mens:
        a = SUCCESSOR.get(r["home_team_name"], r["home_team_name"])
        b = SUCCESSOR.get(r["away_team_name"], r["away_team_name"])
        ga, gb = i(r["home_team_score"]), i(r["away_team_score"])
        year = int(r["tournament_name"][:4])
        last_year[a] = last_year[b] = year
        da = elo[a] - elo[b]
        ea = 1 / (1 + 10 ** (-da / 400))
        sa = 1.0 if ga > gb else 0.5 if ga == gb else 0.0
        gd = abs(ga - gb)
        mult = 1 if gd <= 1 else 1.5 if gd == 2 else (11 + gd) / 8
        k = 40 * mult
        elo[a] += k * (sa - ea)
        elo[b] -= k * (sa - ea)
        played[a] += 1
        played[b] += 1
        for t, gf, gg in ((a, ga, gb), (b, gb, ga)):
            rec[t]["gf"] += gf
            rec[t]["ga"] += gg
            rec[t]["w" if gf > gg else "d" if gf == gg else "l"] += 1
        key = tuple(sorted((a, b)))
        if a == key[0]:
            h2h[key]["a" if ga > gb else "d" if ga == gb else "b"] += 1
        else:
            h2h[key]["b" if ga > gb else "d" if ga == gb else "a"] += 1
        if r["stage_name"] == "final":
            champ = a if (i(r["home_team_win"]) == 1) else b
            titles[champ] += 1

    # teams that appeared in the 10 selectable editions
    current = set()
    for r in mens:
        if int(r["tournament_name"][:4]) in YEARS:
            current.add(SUCCESSOR.get(r["home_team_name"], r["home_team_name"]))
            current.add(SUCCESSOR.get(r["away_team_name"], r["away_team_name"]))
    teams = []
    for t in sorted(current):
        rr = rec[t]
        teams.append({
            "name": t, "flag": FLAG.get(t, ""),
            "elo": round(elo[t], 1), "played": played[t],
            "w": rr["w"], "d": rr["d"], "l": rr["l"], "gf": rr["gf"], "ga": rr["ga"],
            "titles": titles[t], "last": last_year[t],
        })
    h2h_out = {f"{a}|{b}": v for (a, b), v in h2h.items() if a in current and b in current}

    # ---------- per tournament
    tournaments = {}
    for y in YEARS:
        ms = [r for r in mens if int(r["tournament_name"][:4]) == y]
        out_m = []
        group_of = {}
        for r in ms:
            if r["stage_name"] == "group stage":
                group_of[r["home_team_name"]] = r["group_name"].replace("Group ", "")
                group_of[r["away_team_name"]] = r["group_name"].replace("Group ", "")
        pw = points_rule(y)
        for r in ms:
            hs, as_ = i(r["home_team_score"]), i(r["away_team_score"])
            is_group = r["stage_name"] == "group stage"
            out_m.append({
                "id": r["match_id"], "stage": r["stage_name"],
                "group": r["group_name"].replace("Group ", "") if is_group else None,
                "date": r["match_date"], "time": r["match_time"],
                "stadium": r["stadium_name"], "city": r["city_name"],
                "h": {"name": r["home_team_name"], "code": r["home_team_code"],
                      "flag": FLAG.get(r["home_team_name"], ""), "s": hs,
                      "pk": i(r["home_team_score_penalties"]) if i(r["penalty_shootout"]) else None,
                      "pts": (pw if hs > as_ else 1 if hs == as_ else 0) if is_group else None},
                "a": {"name": r["away_team_name"], "code": r["away_team_code"],
                      "flag": FLAG.get(r["away_team_name"], ""), "s": as_,
                      "pk": i(r["away_team_score_penalties"]) if i(r["penalty_shootout"]) else None,
                      "pts": (pw if as_ > hs else 1 if hs == as_ else 0) if is_group else None},
                "et": bool(i(r["extra_time"])),
            })
        stages = [s for s in STAGE_ORDER if any(m["stage"] == s for m in out_m)]

        # overall standings across all matches in the edition
        st = defaultdict(lambda: dict(mp=0, w=0, d=0, l=0, gf=0, ga=0))
        for m in out_m:
            for me, op in ((m["h"], m["a"]), (m["a"], m["h"])):
                s = st[me["name"]]
                s["mp"] += 1
                s["gf"] += me["s"]
                s["ga"] += op["s"]
                s["w" if me["s"] > op["s"] else "d" if me["s"] == op["s"] else "l"] += 1
        table = []
        flags = {}
        for m in out_m:
            flags[m["h"]["name"]] = m["h"]["flag"]
            flags[m["a"]["name"]] = m["a"]["flag"]
        for t, s in st.items():
            table.append({"team": t, "flag": flags[t], "group": group_of.get(t, ""),
                          **s, "gd": s["gf"] - s["ga"], "pts": s["w"] * pw + s["d"],
                          "tcs": tcs.get((y, t), 0) if y <= 2022 else tcs26.get(t)})
        table.sort(key=lambda x: (-x["pts"], -x["gd"], -x["gf"], x["team"]))
        for n, row in enumerate(table, 1):
            row["pos"] = n

        # data-derived recaps for the News page
        final = next(m for m in out_m if m["stage"] == "final")
        champ, runner = (final["h"], final["a"])
        if final["h"]["s"] < final["a"]["s"] or (
                final["h"]["s"] == final["a"]["s"] and (final["h"]["pk"] or 0) < (final["a"]["pk"] or 0)):
            champ, runner = final["a"], final["h"]
        third = next(m for m in out_m if m["stage"] == "third-place match")
        t3 = third["h"] if (third["h"]["s"] > third["a"]["s"] or (
            third["h"]["s"] == third["a"]["s"] and (third["h"]["pk"] or 0) > (third["a"]["pk"] or 0))) else third["a"]
        venue = final["stadium"] + ", " + final["city"] if final["stadium"] else final["city"]
        total_goals = sum(m["h"]["s"] + m["a"]["s"] for m in out_m)
        hosts = Counter(r["country_name"] for r in ms)
        host_txt = " and ".join(c for c, _ in hosts.most_common(2)) if len(hosts) > 1 and y == 2002 else hosts.most_common(1)[0][0]
        if y == 2026:
            host_txt = "Canada, Mexico and the United States"
        elif host_txt == "United States":
            host_txt = "the United States"
        biggest = max(out_m, key=lambda m: (abs(m["h"]["s"] - m["a"]["s"]), m["h"]["s"] + m["a"]["s"]))
        goals_for = Counter()
        for m in out_m:
            goals_for[m["h"]["name"]] += m["h"]["s"]
            goals_for[m["a"]["name"]] += m["a"]["s"]
        top_team, top_goals = goals_for.most_common(1)[0]
        pens = [m for m in out_m if m["h"]["pk"] is not None]
        et = [m for m in out_m if m["et"]]
        semis = [m for m in out_m if m["stage"] == "semi-finals"]

        def score(m):
            base = f'{m["h"]["name"]} {m["h"]["s"]}–{m["a"]["s"]} {m["a"]["name"]}'
            if m["h"]["pk"] is not None:
                base += f' ({m["h"]["pk"]}–{m["a"]["pk"]} on penalties)'
            return base

        news = [{
            "title": f'{champ["name"]} crowned world champions in {host_txt}',
            "details": f'{score(final)} in the final at {venue}, on {pretty_date(final["date"])}. '
                       f'{runner["name"]} finished as runners-up and {t3["name"]} took third place.',
            "flags": [champ["flag"], runner["flag"]], "tag": "Final",
        }, {
            "title": "The road to the final: semi-finals recap",
            "details": " · ".join(score(m) for m in semis) + ".",
            "flags": [semis[0]["h"]["flag"], semis[1]["h"]["flag"]], "tag": "Semi-finals",
        }, {
            "title": f'{len(st)} teams, {len(out_m)} matches and {total_goals} goals',
            "details": f'The {y} tournament produced an average of {total_goals/len(out_m):.2f} goals per match. '
                       f'{top_team} scored the most goals ({top_goals}).',
            "flags": [flags[top_team]], "tag": "Tournament",
        }, {
            "title": f'Biggest margin: {biggest["h"]["name"]} vs {biggest["a"]["name"]}',
            "details": f'{score(biggest)} ({STAGE_LABEL[biggest["stage"]]}, {pretty_date(biggest["date"])}) was the most lopsided result of the tournament.',
            "flags": [biggest["h"]["flag"], biggest["a"]["flag"]], "tag": "Records",
        }]
        if pens:
            news.append({
                "title": f'{len(pens)} penalty shoot-out{"s" if len(pens) > 1 else ""} decided the knockout rounds',
                "details": "; ".join(score(m) for m in pens) + ".",
                "flags": [pens[0]["h"]["flag"], pens[0]["a"]["flag"]], "tag": "Drama",
            })
        elif et:
            news.append({
                "title": f'{len(et)} knockout match{"es" if len(et) > 1 else ""} went to extra time',
                "details": "; ".join(score(m) for m in et) + ".",
                "flags": [et[0]["h"]["flag"], et[0]["a"]["flag"]], "tag": "Drama",
            })

        tournaments[str(y)] = {
            "year": y, "host": host_txt, "stages": stages,
            "stageLabels": {s: STAGE_LABEL[s] for s in stages},
            "pointsPerWin": pw, "matches": out_m, "standings": table, "news": news,
        }

    os.makedirs(os.path.join(ROOT, "src", "data"), exist_ok=True)
    with open(os.path.join(ROOT, "src", "data", "tournaments.json"), "w", encoding="utf-8") as f:
        json.dump(tournaments, f, ensure_ascii=False, separators=(",", ":"))
    with open(os.path.join(ROOT, "src", "data", "teams.json"), "w", encoding="utf-8") as f:
        json.dump({"teams": teams, "h2h": h2h_out}, f, ensure_ascii=False, separators=(",", ":"))
    print("tournaments:", {k: len(v["matches"]) for k, v in tournaments.items()})
    print("teams:", len(teams))
    names26 = {r["team"] for r in tournaments["2026"]["standings"]}
    print("2026 TCS filled:", sum(1 for r in tournaments["2026"]["standings"] if r["tcs"] is not None), "/ 48;",
          "unknown names in tcs_2026.csv:", sorted(set(tcs26) - names26))
    top = sorted(teams, key=lambda t: -t["elo"])[:8]
    print("top elo:", [(t["name"], t["elo"]) for t in top])
    print("2022 top 5:", [(r["pos"], r["team"], r["group"], r["pts"]) for r in tournaments["2022"]["standings"][:5]])
    missing = {m[k]["name"] for t in tournaments.values() for m in t["matches"] for k in ("h", "a") if not m[k]["flag"]}
    print("teams shown with code badge instead of flag:", sorted(missing))


if __name__ == "__main__":
    main()
