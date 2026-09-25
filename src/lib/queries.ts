import { db } from "./db";
import {
  participants,
  pullRequests,
  triviaRounds,
  triviaScores,
} from "./schema";
import { asc, eq } from "drizzle-orm";
import { combinedScore, rank } from "./scoring";
export async function snapshot() {
  const [people, prs, rounds, scores] = await Promise.all([
    db.select().from(participants),
    db.select().from(pullRequests),
    db.select().from(triviaRounds).orderBy(asc(triviaRounds.position)),
    db.select().from(triviaScores),
  ]);
  const byUser = new Map(
    people.map((p) => [
      p.githubUsername,
      {
        ...p,
        contribution: 0,
        trivia: 0,
        count: 0,
        recent: "",
        repos: new Set<string>(),
        roundScores: new Map<number, number>(),
      },
    ]),
  );
  prs.forEach((p) => {
    let x = byUser.get(p.author.toLowerCase());
    if (!x) {
      x = {
        id: 0,
        githubUsername: p.author.toLowerCase(),
        displayName: p.author,
        avatarUrl: null,
        contribution: 0,
        trivia: 0,
        count: 0,
        recent: "",
        repos: new Set<string>(),
        roundScores: new Map(),
      };
      byUser.set(x.githubUsername, x);
    }
    x.contribution += p.points;
    x.count++;
    x.repos.add(p.repo);
    if (p.mergedAt > x.recent) x.recent = p.mergedAt;
  });
  scores.forEach((s) => {
    const x = [...byUser.values()].find((p) => p.id === s.participantId);
    if (x) {
      x.trivia += s.points;
      x.roundScores.set(s.roundId, s.points);
    }
  });
  return { people: [...byUser.values()], prs, rounds };
}
export async function overall() {
  const s = await snapshot();
  return rank(
    s.people.map((p) => ({
      ...p,
      total: combinedScore(p.contribution, p.trivia),
    })),
  );
}
export async function contributors() {
  const s = await snapshot();
  return rank(
    s.people
      .filter((p) => p.count)
      .map((p) => ({ ...p, total: p.contribution })),
  );
}
export async function trivia() {
  const s = await snapshot();
  const last = s.rounds.at(-1)?.id;
  return {
    rounds: s.rounds,
    rows: rank(
      s.people.map((p) => ({
        ...p,
        total: p.trivia,
        lastRound: p.roundScores.get(last || 0) || 0,
      })),
      "round",
    ),
  };
}
export async function repos() {
  const s = await snapshot();
  const m = new Map<
    string,
    { repo: string; count: number; authors: Set<string> }
  >();
  s.prs.forEach((p) => {
    const x = m.get(p.repo) || { repo: p.repo, count: 0, authors: new Set() };
    x.count++;
    x.authors.add(p.author);
    m.set(p.repo, x);
  });
  return [...m.values()]
    .sort((a, b) => b.count - a.count)
    .map((x) => ({ ...x, contributors: x.authors.size }));
}
export async function repo(name: string) {
  const s = await snapshot();
  const prs = s.prs.filter((p) => p.repo === name);
  const totals = new Map<
    string,
    { points: number; count: number; recent: string }
  >();
  prs.forEach((p) => {
    const x = totals.get(p.author) || { points: 0, count: 0, recent: "" };
    x.points += p.points;
    x.count++;
    if (p.mergedAt > x.recent) x.recent = p.mergedAt;
    totals.set(p.author, x);
  });
  return {
    prs,
    rows: rank(
      [...totals].map(([username, x]) => {
        const p = s.people.find((v) => v.githubUsername === username);
        return {
          ...(p || {
            githubUsername: username,
            displayName: username,
            avatarUrl: null,
          }),
          ...x,
          total: x.points,
        };
      }),
    ),
  };
}
