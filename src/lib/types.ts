export type Side = {
  name: string;
  code: string;
  flag: string;
  s: number;
  pk: number | null;
  pts: number | null;
};

export type Match = {
  id: string;
  stage: string;
  group: string | null;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM, local kick-off time
  stadium: string;
  city: string;
  h: Side;
  a: Side;
  et: boolean;
};

export type Standing = {
  pos: number;
  team: string;
  flag: string;
  group: string;
  mp: number;
  w: number;
  d: number;
  l: number;
  gf: number;
  ga: number;
  gd: number;
  tcs: number | null; // Team Conduct Score, null when card data is unavailable
  pts: number;
};

export type NewsItem = {
  title: string;
  details: string;
  flags: string[];
  tag: string;
};

export type Tournament = {
  year: number;
  host: string;
  stages: string[];
  stageLabels: Record<string, string>;
  pointsPerWin: number;
  matches: Match[];
  standings: Standing[];
  news: NewsItem[];
};

export type Team = {
  name: string;
  flag: string;
  elo: number;
  played: number;
  w: number;
  d: number;
  l: number;
  gf: number;
  ga: number;
  titles: number;
  last: number;
};
