import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

vi.mock("next/navigation", () => ({ usePathname: () => "/" }));
vi.mock("next/link", () => ({
  default: ({ href, children, ...p }: any) => (
    <a href={href} {...p}>
      {children}
    </a>
  ),
}));

import HomePage from "@/app/page";
import NewsPage from "@/app/news/page";
import MatchesPage from "@/app/matches/page";
import PredictsPage from "@/app/predicts/page";
import { CookieProvider } from "@/components/CookieConsent";
import { Footer } from "@/components/Footer";

beforeEach(() => {
  document.cookie = "gtw_consent=; path=/; max-age=0";
  localStorage.clear();
});
afterEach(cleanup);

describe("year filter (Home, News, Matches)", () => {
  for (const [name, Page] of [
    ["Home", HomePage],
    ["News", NewsPage],
    ["Matches", MatchesPage],
  ] as const) {
    it(`${name}: offers exactly the 10 most recent World Cups`, () => {
      render(<Page />);
      const opts = within(screen.getByLabelText("World Cup year")).getAllByRole("option");
      expect(opts.map((o) => o.textContent)).toEqual(
        ["2022", "2018", "2014", "2010", "2006", "2002", "1998", "1994", "1990", "1986"],
      );
    });
  }

  it("Home: all stages for 2022 and kick-off format xx/xx/xx - 00:00", () => {
    render(<HomePage />);
    for (const s of ["Group Stage", "Round of 16", "Quarter-finals", "Semi-finals", "3rd Place Play-off", "Final"]) {
      expect(screen.getAllByText(new RegExp(s)).length).toBeGreaterThan(0);
    }
    expect(screen.getByText("20/11/22 - 19:00")).toBeTruthy(); // Qatar v Ecuador
    expect(screen.getAllByText("Argentina").length).toBeGreaterThan(0);
  });

  it("Home: switching year changes the data", async () => {
    render(<HomePage />);
    await userEvent.selectOptions(screen.getByLabelText("World Cup year"), "1986");
    expect(screen.getByText("31/05/86 - 12:00")).toBeTruthy(); // 1986 opener: Italy v Bulgaria
    expect(screen.queryByText("20/11/22 - 19:00")).toBeNull();
  });

  it("Matches: overall table shows 'Team (Group X)' with all metrics", () => {
    render(<MatchesPage />);
    expect(screen.getByText("France (Group D)")).toBeTruthy();
    for (const h of ["POS.", "TEAM", "MATCH", "W", "D", "L", "GF", "GA", "GD", "Pts"]) {
      expect(screen.getByRole("columnheader", { name: h })).toBeTruthy();
    }
    expect(screen.getAllByRole("row").length).toBe(33); // header + 32 teams
  });
});

describe("Predicts flow", () => {
  // list items have the accessible name "Flag of X X"; search inside the open listbox only
  const option = (team: string) => within(screen.getByRole("listbox")).getByRole("button", { name: new RegExp(`${team}$`) });

  it("hides PREDICTS RESULT until both teams are chosen, then shows winner + %", async () => {
    render(<PredictsPage />);
    expect(screen.queryByRole("button", { name: "PREDICTS RESULT" })).toBeNull();

    await userEvent.click(screen.getAllByText("Select Team")[0]);
    await userEvent.click(option("France"));
    expect(screen.queryByRole("button", { name: "PREDICTS RESULT" })).toBeNull();

    await userEvent.click(screen.getByText("Select Team"));
    expect(option("France").hasAttribute("disabled")).toBe(true); // can't pick same team
    await userEvent.click(option("Qatar"));

    const btn = screen.getByRole("button", { name: "PREDICTS RESULT" });
    await userEvent.click(btn);
    expect(screen.getByText("Result :")).toBeTruthy();
    expect(screen.getByText("Win Rate :")).toBeTruthy();
    expect(screen.getAllByText(/\d+ %/).length).toBe(1);
    expect(screen.getAllByText("France").length).toBeGreaterThan(1); // predicted winner shown
  });

  it("shows the exact educational disclaimer", () => {
    render(<PredictsPage />);
    expect(screen.getByText("Educational Disclaimer")).toBeTruthy();
    expect(screen.getByText(/strictly as part of a term project for the Ethics course/)).toBeTruthy();
    expect(screen.getByText(/No Gambling Endorsement:/)).toBeTruthy();
    expect(screen.getByText(/No Real-Money System:/)).toBeTruthy();
    expect(screen.getByText(/Data Attribution:/)).toBeTruthy();
  });
});

describe("Cookie management", () => {
  const app = () =>
    render(
      <CookieProvider>
        <Footer />
      </CookieProvider>,
    );

  it("shows banner, accept stores consent cookie and hides banner", async () => {
    app();
    expect(await screen.findByText("Our website is using cookies")).toBeTruthy();
    await userEvent.click(screen.getByRole("button", { name: "I accept for cookies" }));
    expect(screen.queryByText("Our website is using cookies")).toBeNull();
    expect(decodeURIComponent(document.cookie)).toContain('"analytics":true');
    expect(localStorage.getItem("gtw_pageviews")).toBe("1");
  });

  it("settings modal: necessary locked on, analytical off by default, save respects choice", async () => {
    app();
    await userEvent.click(await screen.findByRole("button", { name: "Setting cookies" }));
    const necessary = screen.getByRole("switch", { name: /Necessary/ });
    const analytical = screen.getByRole("switch", { name: /Analytical/ });
    expect(necessary.getAttribute("aria-checked")).toBe("true");
    expect(necessary.hasAttribute("disabled")).toBe(true);
    expect(analytical.getAttribute("aria-checked")).toBe("false");
    await userEvent.click(screen.getByRole("button", { name: "Save preferences" }));
    expect(decodeURIComponent(document.cookie)).toContain('"analytics":false');
    expect(localStorage.getItem("gtw_pageviews")).toBeNull(); // no analytics without opt-in
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("does not show the banner again once a choice exists, but settings stay reachable", async () => {
    document.cookie = `gtw_consent=${encodeURIComponent('{"necessary":true,"analytics":false}')}; path=/`;
    app();
    await screen.findByText("Cookie settings");
    expect(screen.queryByText("Our website is using cookies")).toBeNull();
    await userEvent.click(screen.getByText("Cookie settings"));
    expect(screen.getByRole("dialog")).toBeTruthy();
  });
});
