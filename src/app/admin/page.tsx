import { isAdmin, signIn, signOut } from "@/lib/auth";
import { snapshot } from "@/lib/queries";
import {
  addRound,
  addWatchedRepo,
  removeContributor,
  removeWatchedRepo,
} from "@/lib/actions";
import { db } from "@/lib/db";
import { syncState } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { ResetButton, SyncButton } from "@/components/admin-controls";
import { ScoreGrid } from "@/components/score-grid";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

export default async function Admin({ searchParams }: {
  searchParams: Promise<{ error?: string }>;
}) {
  if (!(await isAdmin())) return <Login failed={(await searchParams).error === "invalid"} />;
  const { people, rounds } = await snapshot();
  const watchedRepos = JSON.parse(db.select().from(syncState).where(eq(syncState.key, "watched_repos")).get()?.value || "[]") as string[];
  return (
    <main>
      <div className="mb-6 flex items-center justify-between gap-4">
        <h1 className="text-3xl font-black">Admin</h1>
        <form action={async () => {
          "use server";
          await signOut();
          redirect("/admin");
        }}>
          <Button type="submit" variant="outline">Sign out</Button>
        </form>
      </div>
      <Card className="admin-panel mb-8 p-5">
        <h2 className="font-bold">Watched repositories</h2>
        <p className="mt-2 muted">Enter a repository name or a full <code>organisation/repository</code> name.</p>
        <form action={addWatchedRepo} className="mt-3 flex flex-wrap gap-2"><Input name="repo" placeholder="repository-name or org/repository" required className="w-auto" /><Button type="submit">Add repository</Button></form>
        <p className="mt-2 muted">Deleting a repository also removes its synced pull requests from the leaderboard.</p>
        <div className="mt-3 flex flex-col gap-2">
          {watchedRepos.map((repo) => (
            <div key={repo} className="flex flex-wrap items-center justify-between gap-3 rounded-md border p-3">
              <span className="break-all">{repo}</span>
              <form action={removeWatchedRepo.bind(null, repo)}>
                <Button type="submit" variant="destructive" size="sm" aria-label={`Delete ${repo}`}>
                  Delete repository
                </Button>
              </form>
            </div>
          ))}
          {!watchedRepos.length && <p className="muted">No watched repositories yet.</p>}
        </div>
      </Card>
      <Card className="admin-panel mb-8 p-5">
        <h2 className="font-bold">GitHub contributors</h2>
        <p className="mt-2 muted">
          Contributors are imported automatically from eligible merged pull
          requests during GitHub sync. {people.filter((p) => p.id).length} are
          currently synced.
        </p>
        <p className="mt-2 muted">Deleting a contributor removes their synced pull requests and trivia scores. A later GitHub sync may add them again.</p>
        <div className="mt-3 flex flex-col gap-2">
          {people.filter((person) => person.id).map((person) => (
            <div key={person.id} className="flex flex-wrap items-center justify-between gap-3 rounded-md border p-3">
              <span className="min-w-0 break-all">{person.displayName} <span className="muted">@{person.githubUsername}</span></span>
              <form action={removeContributor.bind(null, person.githubUsername)}>
                <Button type="submit" variant="destructive" size="sm" aria-label={`Delete contributor ${person.githubUsername}`}>
                  Delete contributor
                </Button>
              </form>
            </div>
          ))}
          {!people.some((person) => person.id) && <p className="muted">No synced contributors yet.</p>}
        </div>
      </Card>
      <Card className="admin-panel mb-8 p-5">
        <h2 className="font-bold">Trivia rounds</h2>
        <form action={addRound} className="mt-3 flex flex-wrap gap-2">
          <Input name="name" placeholder="Round name" required className="w-auto" />
          <Input
            name="position"
            type="number"
            placeholder="Position"
            required
          />
          <Input
            name="maxPoints"
            type="number"
            placeholder="Max points"
            required
          />
          <Button type="submit">Create round</Button>
        </form>
      </Card>
      <Card className="admin-panel mb-8 p-5">
        <h2 className="font-bold">Score entry</h2>
        {!rounds.length ? (
          <p className="mt-2 muted">Create a round first.</p>
        ) : (
          <ScoreGrid people={people.filter((p) => p.id)} rounds={rounds} />
        )}
      </Card>
      <Card className="admin-panel mb-8 p-5">
        <h2 className="font-bold">GitHub sync</h2>
        <SyncButton />
      </Card>
      <ResetButton />
    </main>
  );
}
function Login({ failed }: { failed: boolean }) {
  return (
    <main className="flex flex-col items-center justify-center">
      <h1 className="mb-4 text-center text-3xl font-black">Admin sign in</h1>
      <form
        action={async (f) => {
          "use server";
          const username = f.get("username");
          const password = f.get("password");
          if (typeof username !== "string" || typeof password !== "string" || !(await signIn(username, password))) {
            redirect("/admin?error=invalid");
          }
          redirect("/admin");
        }}
        className="admin-panel flex w-full max-w-md flex-col gap-3 rounded-xl border p-5 shadow-sm"
      >
        <label htmlFor="admin-username">Username</label>
        <Input id="admin-username" name="username" autoComplete="username" required />
        <label htmlFor="admin-password">Password</label>
        <Input
          id="admin-password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
        />
        {failed && <p role="alert" className="text-sm text-destructive">Invalid username or password.</p>}
        <Button type="submit">Sign in</Button>
      </form>
    </main>
  );
}
