import {
  integer,
  sqliteTable,
  text,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";
export const participants = sqliteTable("participants", {
  id: integer("id").primaryKey(),
  githubUsername: text("github_username").notNull().unique(),
  displayName: text("display_name").notNull(),
  avatarUrl: text("avatar_url"),
});
export const pullRequests = sqliteTable(
  "pull_requests",
  {
    id: integer("id").primaryKey(),
    repo: text("repo").notNull(),
    number: integer("number").notNull(),
    author: text("author").notNull(),
    title: text("title").notNull(),
    url: text("url").notNull(),
    labels: text("labels").notNull().default("[]"),
    mergedAt: text("merged_at").notNull(),
    points: integer("points").notNull(),
  },
  (t) => ({ prRepoNumber: uniqueIndex("pr_repo_number").on(t.repo, t.number) }),
);
export const triviaRounds = sqliteTable("trivia_rounds", {
  id: integer("id").primaryKey(),
  name: text("name").notNull(),
  position: integer("position").notNull(),
  maxPoints: integer("max_points").notNull(),
});
export const triviaScores = sqliteTable(
  "trivia_scores",
  {
    participantId: integer("participant_id")
      .notNull()
      .references(() => participants.id, { onDelete: "cascade" }),
    roundId: integer("round_id")
      .notNull()
      .references(() => triviaRounds.id, { onDelete: "cascade" }),
    points: integer("points").notNull(),
  },
  (t) => ({
    scoreParticipantRound: uniqueIndex("score_participant_round").on(
      t.participantId,
      t.roundId,
    ),
  }),
);
export const syncState = sqliteTable("sync_state", {
  key: text("key").primaryKey(),
  value: text("value").notNull(),
});
