"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { LeaderboardData } from "@/lib/live-leaderboard";
import { Input } from "@/components/ui/input";

type Row = LeaderboardData["rows"][number];
function Trophy() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      aria-hidden="true"
    >
      <path d="M8 3h8v7a4 4 0 0 1-8 0V3Z" />
      <path d="M8 5H4v3a4 4 0 0 0 4 4m8-7h4v3a4 4 0 0 1-4 4m-4 2v5m-4 2h8m-6-2h4" />
    </svg>
  );
}
function Avatar({ person, winner = false }: { person: Row; winner?: boolean }) {
  const [failed, setFailed] = useState(false);
  return (
    <span className={`avatar ${winner ? "winner-avatar" : ""}`}>
      {person.avatarUrl && !failed ? (
        <img src={person.avatarUrl} alt="" onError={() => setFailed(true)} />
      ) : (
        <span>{person.displayName.slice(0, 2).toUpperCase()}</span>
      )}
      {winner && (
        <span className="avatar-trophy" title="Top-ranked contributor">
          <Trophy />
        </span>
      )}
    </span>
  );
}
const number = (value: number) => value.toLocaleString("en-US");
function date(value: string | null) {
  return value
    ? new Date(value).toLocaleString("en-GB", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        timeZone: "UTC",
      }) + " UTC"
    : "Awaiting first sync";
}

export function Leaderboard({
  initial,
  mode,
}: {
  initial: LeaderboardData;
  mode: "overall" | "contributors";
}) {
  const [data, setData] = useState(initial);
  const [status, setStatus] = useState("Connecting");
  const [query, setQuery] = useState("");
  const [movements, setMovements] = useState<Record<string, number>>({});
  const previous = useRef(initial.rows);
  const movementTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    const source = new EventSource(`/api/live?mode=${mode}`);
    source.onopen = () => setStatus("Live updates");
    source.onerror = () => setStatus("Reconnecting");
    source.onmessage = (event) => {
      const next: LeaderboardData = JSON.parse(event.data);
      const ranks = new Map(
        previous.current.map((row) => [row.githubUsername, row.rank]),
      );
      setMovements(
        Object.fromEntries(
          next.rows.map((row) => [
            row.githubUsername,
            (ranks.get(row.githubUsername) ?? row.rank) - row.rank,
          ]),
        ),
      );
      previous.current = next.rows;
      setData(next);
      setStatus("Live updates");
      if (movementTimer.current) clearTimeout(movementTimer.current);
      movementTimer.current = setTimeout(() => setMovements({}), 6000);
    };
    return () => {
      source.close();
      if (movementTimer.current) clearTimeout(movementTimer.current);
    };
  }, [mode]);
  const rows = data.rows.filter((p) =>
    `${p.displayName} ${p.githubUsername}`
      .toLowerCase()
      .includes(query.toLowerCase()),
  );
  const leader = data.rows[0];
  if (mode === "contributors")
    return (
      <main className="contributors-page">
        <section className="contributors-intro">
          <div>
            <span className="eyebrow">EVERY CONTRIBUTOR COUNTS</span>
            <h1>Contributors</h1>
            <p>
              Everyone with an eligible merged pull request, ranked from top to
              bottom.
            </p>
          </div>
        
        </section>
        <div
          className="contributors-list"
          role="table"
          aria-label="All contributors ranked from top to bottom"
          aria-rowcount={data.rows.length + 1}
        >
          <div className="contributors-list-header" role="row">
            <span>Rank</span>
            <span>Contributor</span>
            <span>Merged PRs</span>
            <span>Repositories</span>
            <span>Points</span>
          </div>
          {data.rows.map((person) => (
            <div
              className="contributors-list-row"
              role="row"
              key={person.githubUsername}
            >
              <span className="contributor-rank">
                {String(person.rank).padStart(2, "0")}
              </span>
              <div className="person-cell">
                <Avatar person={person} winner={person.rank === 1} />
                <div>
                  <a
                    href={`https://github.com/${encodeURIComponent(person.githubUsername)}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {person.displayName}
                  </a>
                  <small>@{person.githubUsername}</small>
                </div>
              </div>
              <span className="numeric">{number(person.count)}</span>
              <span className="numeric">{number(person.repositories)}</span>
              <strong className="contributor-points">
                {number(person.total)}
              </strong>
            </div>
          ))}
          {!data.rows.length && (
            <div className="board-empty">
              <span>✳</span>
              <h3>No contributors yet.</h3>
              <p>Run a GitHub sync to import eligible merged pull requests.</p>
            </div>
          )}
        </div>
        <footer className="dashboard-footer">
          <span>
            {data.rows.length} contributor{data.rows.length === 1 ? "" : "s"}
          </span>
          <span>GitHub sync: {date(data.lastSync)}</span>
        </footer>
      </main>
    );
  return (
    <main className="dashboard">
      <section className="stats mt-8" aria-label="Community statistics">
        {[
          [
            "Contributors",
            data.stats.contributors,
            "People building together",
            "◎",
          ],
          [
            "Merged pull requests",
            data.stats.merges,
            "Ideas turned into impact",
            "⑂",
          ],
          [
            "Repositories",
            data.stats.repositories,
            "Projects moving forward",
            "▤",
          ],
          [
            "Community points",
            data.stats.points,
            "Contributions + trivia",
            "✧",
          ],
        ].map(([label, value, hint, icon]) => (
          <div className="stat" key={label}>
            <div className="stat-label">
              {label}
              <span>{icon}</span>
            </div>
            <strong>{number(Number(value))}</strong>
            <small>{hint}</small>
          </div>
        ))}
      </section>
      <div className="dashboard-columns">
        <section className="standings">
          <div className="section-heading">
            <div>
              <span className="eyebrow">THE PEOPLE BEHIND THE PROGRESS</span>
              <h2>
                The leaderboard
                <span className="count-chip">{data.rows.length}</span>
              </h2>
            </div>
           
          </div>
          <div className="board-toolbar">
           
            <label className="search">
              <span aria-hidden="true">⌕</span>
              <Input
                className="border-0 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
                aria-label="Search contributors"
                placeholder="Find a contributor…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </label>
          </div>
          <div className="board-scroll">
            <div
              className="board-table"
              role="table"
              aria-label="Contributor rankings"
              aria-rowcount={rows.length + 1}
            >
              <div className="board-grid board-labels" role="row">
                <span role="columnheader">Rank</span>
                <span role="columnheader">Contributor</span>
                <span role="columnheader">Merged PRs</span>
                <span role="columnheader">Trivia</span>
                <span role="columnheader">Points</span>
              </div>
              <div
                className="rank-list"
                role="rowgroup"
                style={
                  {
                    height: rows.length * 88,
                    "--row-count": rows.length,
                  } as React.CSSProperties
                }
              >
                {rows.map((person, index) => (
                  <div
                    role="row"
                    aria-rowindex={index + 2}
                    key={person.githubUsername}
                    className={`board-grid rank-row ${person.rank === 1 ? "leading-row" : ""}`}
                    style={
                      {
                        transform: `translateY(${index * 88}px)`,
                        "--row-index": index,
                      } as React.CSSProperties
                    }
                  >
                    <div role="cell" className="rank-number">
                      <span>{String(person.rank).padStart(2, "0")}</span>
                      {!!movements[person.githubUsername] && (
                        <small
                          className={
                            movements[person.githubUsername] > 0
                              ? "rank-up"
                              : "rank-down"
                          }
                        >
                          {movements[person.githubUsername] > 0 ? "↑" : "↓"}
                          {Math.abs(movements[person.githubUsername])}
                        </small>
                      )}
                    </div>
                    <div role="cell" className="person-cell">
                      <Avatar person={person} winner={person.rank === 1} />
                      <div>
                        <a
                          href={`https://github.com/${encodeURIComponent(person.githubUsername)}`}
                          target="_blank"
                          rel="noreferrer"
                        >
                          {person.displayName}
                        </a>
                        <small>@{person.githubUsername}</small>
                      </div>
                    </div>
                    <span role="cell" className="numeric muted">
                      {number(person.count)}
                    </span>
                    <span role="cell" className="numeric muted">
                      {number(
                        mode === "overall"
                          ? person.trivia
                          : person.repositories,
                      )}
                    </span>
                    <div role="cell" className="score-cell">
                      <strong>{number(person.total)}</strong>
                      <span className="score-track">
                        <i
                          style={{
                            width: `${leader?.total ? Math.max(0, (person.total / leader.total) * 100) : 0}%`,
                          }}
                        />
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          {!rows.length && (
            <div className="board-empty">
              <span>✳</span>
              <h3>
                {query
                  ? "No contributors found"
                  : "Your next commit starts something."}
              </h3>
              <p>
                {query
                  ? "Try another name or GitHub username."
                  : "Contributors will appear here when eligible pull requests are synced."}
              </p>
              {!query && <Link href="/admin">Set up your repositories ↗</Link>}
            </div>
          )}
          <div className="board-footer">
            <span>
              Showing {rows.length} of {data.rows.length} contributors
            </span>
            <span>↕ Rankings update automatically</span>
          </div>
        </section>
        <aside className="sidebar">
          <section className="leader-card">
            <div className="eyebrow">
              <Trophy /> IN THE SPOTLIGHT
            </div>
            {leader ? (
              <>
                <Avatar key={leader.githubUsername} person={leader} winner />
                <h3>{leader.displayName}</h3>
                <a
                  href={`https://github.com/${encodeURIComponent(leader.githubUsername)}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  @{leader.githubUsername} ↗
                </a>
                <p>Leading the way, one contribution at a time.</p>
                <div className="leader-numbers">
                  <div>
                    <strong>{number(leader.total)}</strong>
                    <small>TOTAL POINTS</small>
                  </div>
                  <div>
                    <strong>{number(leader.count)}</strong>
                    <small>MERGED PRS</small>
                  </div>
                </div>
              </>
            ) : (
              <div className="spotlight-empty">
                <Trophy />
                <h3>A spot worth earning.</h3>
                <p>
                  The first contributor takes the spotlight. Make your mark.
                </p>
              </div>
            )}
          </section>
          <section className="activity-card">
            <div className="activity-heading">
              <h2>Freshly merged</h2>
              <span className="activity-dot" />
            </div>
            <p className="muted">Little wins. Lasting impact.</p>
            <div className="activity-list">
              {data.activity.map((pr) => (
                <a
                  className="activity-item"
                  key={pr.id}
                  href={pr.url}
                  target="_blank"
                  rel="noreferrer"
                >
                  <span className="merge-icon">⑂</span>
                  <div>
                    <strong>{pr.title}</strong>
                    <p>
                      <span>@{pr.author}</span> · {pr.repo}
                    </p>
                    <small>{date(pr.mergedAt)}</small>
                  </div>
                  <span className="points-chip">+{pr.points}</span>
                </a>
              ))}
              {!data.activity.length && (
                <p className="activity-empty">
                  The next merged pull request could be yours. Recent
                  contributions will appear here.
                </p>
              )}
            </div>
            <Link href="/repos" className="text-link">
              Explore the repositories <span>↗</span>
            </Link>
          </section>
          <div className="community-note">
            <span>✳</span>
            <p>
              Good contributions are a team sport.
              <br />
              <strong>Thanks for playing your part.</strong>
            </p>
          </div>
        </aside>
      </div>
      <footer className="dashboard-footer">
        <span>Made of commits & community.</span>
        <span>GitHub sync: {date(data.lastSync)}</span>
      </footer>
    </main>
  );
}
