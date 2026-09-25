export const LABEL_POINTS: Record<string, number> = {
  intermediate: 2,
  hard: 3,
};
export const isBot = (login: string) =>
  /^(dependabot|github-actions)$/i.test(login) || /\[bot\]$/i.test(login);
export const prPoints = (labels: string[]) =>
  labels.reduce(
    (best, l) => Math.max(best, LABEL_POINTS[l.toLowerCase()] || 1),
    1,
  );
export const isEligiblePr = (
  p: { author: string; labels: string[]; mergedAt: string },
  start: string,
  end: string,
  maintainers: string[] = [],
) =>
  !isBot(p.author) &&
  !maintainers.map((x) => x.toLowerCase()).includes(p.author.toLowerCase()) &&
  !p.labels.some((l) => ["invalid", "spam"].includes(l.toLowerCase())) &&
  p.mergedAt >= `${start}T00:00:00.000Z` &&
  p.mergedAt <= `${end}T23:59:59.999Z`;
export type Rankable = { total: number; recent?: string; lastRound?: number };

export function rank<T extends Rankable>(
  rows: T[],
  tie: "recent" | "round" = "recent",
) {
  const sorted = [...rows].sort(
    (a, b) =>
      b.total - a.total ||
      (tie === "recent"
        ? (b.recent || "").localeCompare(a.recent || "")
        : (b.lastRound || 0) - (a.lastRound || 0)),
  );
  let previous: number | undefined,
    rank = 0;
  return sorted.map((row, i) => {
    if (row.total !== previous) rank = i + 1;
    previous = row.total;
    return { ...row, rank };
  });
}
export const combinedScore = (
  contribution: number,
  trivia: number,
  cw = Number(process.env.CONTRIBUTION_WEIGHT || 1),
  tw = Number(process.env.TRIVIA_WEIGHT || 1),
) => contribution * cw + trivia * tw;
