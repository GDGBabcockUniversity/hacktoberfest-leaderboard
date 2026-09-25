import { NextRequest, NextResponse } from "next/server";
import { Octokit } from "@octokit/rest";
import { db } from "@/lib/db";
import { participants, pullRequests, syncState } from "@/lib/schema";
import { isEligiblePr, prPoints } from "@/lib/scoring";
import { eq } from "drizzle-orm";

export async function POST(req: NextRequest) {
  if (!process.env.SYNC_SECRET ||req.headers.get("x-sync-secret") !== process.env.SYNC_SECRET)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const token = process.env.GITHUB_TOKEN,
    org = process.env.GITHUB_ORG,
    start = process.env.EVENT_START,
    end = process.env.EVENT_END;
  if (!token || !org || !start || !end)
    return NextResponse.json(
      { error: "GitHub sync is not configured" },
      { status: 500 },
    );
  try {
    const kit = new Octokit({ auth: token });
    const maintainers = (process.env.MAINTAINERS || "")
      .split(",")
      .map((x) => x.trim())
      .filter(Boolean);
    const watched = await db.select().from(syncState).where(eq(syncState.key, "watched_repos")).get();
    const repos = JSON.parse(watched?.value || "[]") as string[];
    if (!repos.length) return NextResponse.json({ error: "No watched repositories configured. Add repositories in Admin before syncing." }, { status: 400 });
    const profiles = new Map<string, { displayName: string; avatarUrl: string }>();
    let stored = 0;
    for (const configuredRepo of repos) {
      const fullRepo = configuredRepo.includes("/") ? configuredRepo : `${org}/${configuredRepo}`;
      let page = 1;
      while (true) {
      const res = await kit.rest.search.issuesAndPullRequests({
        q: `repo:${fullRepo} is:pr is:merged merged:${start}..${end}`,
        per_page: 100,
        page,
      });
      if (Number(res.headers["x-ratelimit-remaining"] || 1) < 1)
        return NextResponse.json(
          { error: "GitHub rate limit reached; sync stopped safely.", stored },
          { status: 429 },
        );
      for (const issue of res.data.items) {
        const pr = await kit.rest.pulls.get({
          owner: issue.repository_url.split("/").at(-2)!,
          repo: issue.repository_url.split("/").at(-1)!,
          pull_number: issue.number,
        });
        const labels = pr.data.labels.map((l) =>
          typeof l === "string" ? l : l.name || "",
        );
        const author = pr.data.user?.login || "";
        const mergedAt = pr.data.merged_at;
        if (
          !mergedAt ||
          !isEligiblePr({ author, labels, mergedAt }, start, end, maintainers)
        )
          continue;
        // Contributor profiles are sourced from GitHub, never manually entered.
        const username = author.toLowerCase();
        let profile = profiles.get(username);
        if (!profile) {
          const user = await kit.rest.users.getByUsername({ username: author });
          profile = {
            displayName: user.data.name || user.data.login,
            avatarUrl: user.data.avatar_url,
          };
          profiles.set(username, profile);
        }
        await db.insert(participants)
          .values({ githubUsername: username, ...profile })
          .onConflictDoUpdate({
            target: participants.githubUsername,
            set: profile,
          })
          .run();
        await db.insert(pullRequests)
          .values({
            repo: pr.data.base.repo.name,
            number: pr.data.number,
            author: username,
            title: pr.data.title,
            url: pr.data.html_url,
            labels: JSON.stringify(labels),
            mergedAt,
            points: prPoints(labels),
          })
          .onConflictDoUpdate({
            target: [pullRequests.repo, pullRequests.number],
            set: {
              author: username,
              title: pr.data.title,
              url: pr.data.html_url,
              labels: JSON.stringify(labels),
              mergedAt,
              points: prPoints(labels),
            },
          })
          .run();
        stored++;
      }
      if (res.data.items.length < 100) break;
      page++;
    }
    }
    await db.insert(syncState)
      .values({ key: "last_successful_sync", value: new Date().toISOString() })
      .onConflictDoUpdate({
        target: syncState.key,
        set: { value: new Date().toISOString() },
      })
      .run();
    return NextResponse.json({ ok: true, stored, participants: profiles.size });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Sync failed" },
      { status: 500 },
    );
  }
}
