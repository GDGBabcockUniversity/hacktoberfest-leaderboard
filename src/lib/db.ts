import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import * as schema from "./schema";
import { mkdirSync } from "node:fs";
import { dirname } from "node:path";

const file = process.env.DATABASE_URL || "./data/app.db";

mkdirSync(dirname(file), { recursive: true });

const sqlite = new Database(file);

sqlite.pragma("journal_mode = WAL");
sqlite.exec(
  `CREATE TABLE IF NOT EXISTS participants (
  id INTEGER PRIMARY KEY,
  github_username TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  avatar_url TEXT);
  CREATE TABLE IF NOT EXISTS pull_requests (
  id INTEGER PRIMARY KEY,
  repo TEXT NOT NULL,
  number INTEGER NOT NULL,
  author TEXT NOT NULL,
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  labels TEXT NOT NULL DEFAULT '[]',
  merged_at TEXT NOT NULL,
  points INTEGER NOT NULL,
  UNIQUE(repo, number));
CREATE TABLE IF NOT EXISTS trivia_rounds (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  position INTEGER NOT NULL,
  max_points INTEGER NOT NULL);
CREATE TABLE IF NOT EXISTS trivia_scores (
  participant_id INTEGER NOT NULL,
  round_id INTEGER NOT NULL,
  points INTEGER NOT NULL,
  UNIQUE(participant_id, round_id));
CREATE TABLE IF NOT EXISTS sync_state (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL);`,
);
export const db = drizzle(sqlite, { schema });
export { sqlite };
