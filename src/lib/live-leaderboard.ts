import { snapshot } from "./queries";
import { combinedScore, rank } from "./scoring";
import { db } from "./db";
import { syncState } from "./schema";
import { eq } from "drizzle-orm";

export async function liveLeaderboard(mode: "overall" | "contributors" = "overall") {
  const { people, prs } = await snapshot();
  const rows = rank(people.filter(p => mode === "overall" || p.count > 0).map(p => ({
    githubUsername: p.githubUsername, displayName: p.displayName, avatarUrl: p.avatarUrl,
    contribution: p.contribution, trivia: p.trivia, count: p.count, recent: p.recent,
    repositories: p.repos.size,
    total: mode === "overall" ? combinedScore(p.contribution, p.trivia) : p.contribution,
  })));
  return {
    rows,
    stats: { contributors: rows.length, merges: prs.length, repositories: new Set(prs.map(p => p.repo)).size, points: rows.reduce((sum, p) => sum + p.total, 0) },
    activity: [...prs].sort((a, b) => b.mergedAt.localeCompare(a.mergedAt)).slice(0, 5).map(p => ({ id: p.id, author: p.author, title: p.title, repo: p.repo, url: p.url, points: p.points, mergedAt: p.mergedAt })),
    lastSync: (await db.select().from(syncState).where(eq(syncState.key, "last_successful_sync")).get())?.value ?? null,
  };
}
export type LeaderboardData = Awaited<ReturnType<typeof liveLeaderboard>>;
