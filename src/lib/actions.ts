"use server";

import { revalidatePath } from "next/cache";
import { db } from "./db";
import {
  participants,
  pullRequests,
  syncState,
  triviaRounds,
  triviaScores,
} from "./schema";
import { eq, and } from "drizzle-orm";
import { requireAdmin } from "./auth";

const refresh = () =>
  ["/", "/contributors", "/repos", "/trivia", "/admin"].forEach((path) =>
    revalidatePath(path),
  );

export async function addRound(form: FormData) {
  await requireAdmin();
  await db.insert(triviaRounds)
    .values({
      name: String(form.get("name")),
      position: Number(form.get("position")),
      maxPoints: Number(form.get("maxPoints")),
    })
    .run();
  refresh();
}

export async function saveScore(
  participantId: number,
  roundId: number,
  points: number,
) {
  await requireAdmin();
  await db.insert(triviaScores)
    .values({ participantId, roundId, points })
    .onConflictDoUpdate({
      target: [triviaScores.participantId, triviaScores.roundId],
      set: { points },
    })
    .run();
  refresh();
}

export async function resetTrivia() {
  await requireAdmin();
  await db.delete(triviaScores).run();
  await db.delete(triviaRounds).run();
  refresh();
}

export async function addWatchedRepo(form: FormData) {
  await requireAdmin();
  const repo = String(form.get("repo") || "").trim().replace(/^\/+|\/+$/g, "");
  if (!repo) return;
  const current = await db.select().from(syncState).where(eq(syncState.key, "watched_repos")).get();
  const repos = JSON.parse(current?.value || "[]") as string[];
  if (!repos.includes(repo)) repos.push(repo);
  await db.insert(syncState).values({ key: "watched_repos", value: JSON.stringify(repos) }).onConflictDoUpdate({ target: syncState.key, set: { value: JSON.stringify(repos) } }).run();
  revalidatePath("/admin");
}

export async function removeWatchedRepo(repo: string) {
  await requireAdmin();
  const current = await db.select().from(syncState).where(eq(syncState.key, "watched_repos")).get();
  const repos = (JSON.parse(current?.value || "[]") as string[]).filter((item) => item !== repo);
  await db.insert(syncState).values({ key: "watched_repos", value: JSON.stringify(repos) }).onConflictDoUpdate({ target: syncState.key, set: { value: JSON.stringify(repos) } }).run();
  const repoName = repo.split("/").at(-1);
  if (repoName) await db.delete(pullRequests).where(eq(pullRequests.repo, repoName)).run();
  refresh();
}

export async function removeContributor(username: string) {
  await requireAdmin();
  const normalizedUsername = username.trim().toLowerCase();
  if (!normalizedUsername) return;

  const person = await db
    .select({ id: participants.id })
    .from(participants)
    .where(eq(participants.githubUsername, normalizedUsername))
    .get();

  await db.delete(pullRequests)
    .where(eq(pullRequests.author, normalizedUsername))
    .run();
  if (person) {
    await db.delete(triviaScores)
      .where(eq(triviaScores.participantId, person.id))
      .run();
    await db.delete(participants)
      .where(eq(participants.id, person.id))
      .run();
  }
  revalidatePath("/admin");
  refresh();
}
