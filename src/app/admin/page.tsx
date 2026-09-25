import { isAdmin } from "@/lib/auth";
import { snapshot } from "@/lib/queries";
import { addRound, addWatchedRepo, removeWatchedRepo } from "@/lib/actions";
import { db } from "@/lib/db";
import { syncState } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { ResetButton, SyncButton } from "@/components/admin-controls";
import { ScoreGrid } from "@/components/score-grid";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

export default async function Admin() {
  if (!(await isAdmin())) return <Login />;
  const { people, rounds } = await snapshot();
  const watchedRepos = JSON.parse(db.select().from(syncState).where(eq(syncState.key, "watched_repos")).get()?.value || "[]") as string[];
  return (
    <main>
      <h1 className="mb-6 text-3xl font-black">Admin</h1>
      <Card className="admin-panel mb-8 p-5">
        <h2 className="font-bold">Watched repositories</h2>
        <p className="mt-2 muted">Enter a repository name or a full <code>organisation/repository</code> name.</p>
        <form action={addWatchedRepo} className="mt-3 flex flex-wrap gap-2"><Input name="repo" placeholder="repository-name or org/repository" required className="w-auto" /><Button type="submit">Add repository</Button></form>
        <div className="mt-3 flex flex-wrap gap-2">{watchedRepos.map((repo) => <form key={repo} action={async () => { "use server"; await removeWatchedRepo(repo); }}><Button variant="outline" className="admin-repo-button">{repo} ×</Button></form>)}</div>
      </Card>
      <Card className="admin-panel mb-8 p-5">
        <h2 className="font-bold">GitHub contributors</h2>
        <p className="mt-2 muted">
          Contributors are imported automatically from eligible merged pull
          requests during GitHub sync. {people.filter((p) => p.id).length} are
          currently synced.
        </p>
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
function Login() {
  return (
    <main>
      <h1 className="mb-4 text-3xl font-black">Admin sign in</h1>
      <form
        action={async (f) => {
          "use server";
          const { cookies } = await import("next/headers");
          if (String(f.get("password")) === process.env.ADMIN_PASSWORD)
            (await cookies()).set("admin_session", String(f.get("password")), {
              httpOnly: true,
              sameSite: "lax",
              path: "/",
            });
          redirect("/admin");
        }}
        className="admin-panel flex max-w-md flex-col gap-3 rounded-xl border p-5 shadow-sm"
      >
        <Input
          name="password"
          type="password"
          placeholder="Password"
          required
        />
        <Button type="submit">Sign in</Button>
      </form>
    </main>
  );
}
