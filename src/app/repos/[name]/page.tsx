import { repo } from "@/lib/queries";
import { Empty } from "@/components/table";
import { Card } from "@/components/ui/card";
export default async function RepoPage({
  params,
}: {
  params: Promise<{ name: string }>;
}) {
  const { name } = await params;
  const data = await repo(decodeURIComponent(name));
  return (
    <main>
      <h1 className="mb-6 text-3xl font-black">{name}</h1>
      {!data.prs.length ? (
        <Empty>No eligible merged PRs in this repository.</Empty>
      ) : (
        <>
          <h2 className="mb-3 text-xl font-bold">Leaderboard</h2>
          <Card className="card mb-8">
            <table>
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>Contributor</th>
                  <th>Points</th>
                </tr>
              </thead>
              <tbody>
                {data.rows.map((x) => (
                  <tr key={x.githubUsername}>
                    <td>#{x.rank}</td>
                    <td>{x.displayName}</td>
                    <td>{x.points}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
          <h2 className="mb-3 text-xl font-bold">Merged pull requests</h2>
          <Card className="card">
            <table>
              <tbody>
                {data.prs.map((p) => (
                  <tr key={p.id}>
                    <td>
                      <a href={p.url}>
                        #{p.number} {p.title}
                      </a>
                    </td>
                    <td>{p.author}</td>
                    <td>{p.points} pts</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </>
      )}
    </main>
  );
}
