import Link from "next/link";
import { repos } from "@/lib/queries";
import { Empty } from "@/components/table";
import { Card } from "@/components/ui/card";
export default async function Repos() {
  const rows = await repos();
  return (
    <main>
      <h1 className="mb-6 text-3xl font-black">Repositories</h1>
      {!rows.length ? (
        <Empty>No repositories have merged PRs yet.</Empty>
      ) : (
        <Card className="card">
          <table>
            <thead>
              <tr>
                <th>Repository</th>
                <th>Merged PRs</th>
                <th>Contributors</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((x) => (
                <tr key={x.repo}>
                  <td>
                    <Link
                      className="font-bold"
                      href={`/repos/${encodeURIComponent(x.repo)}`}
                    >
                      {x.repo}
                    </Link>
                  </td>
                  <td>{x.count}</td>
                  <td>{x.contributors}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </main>
  );
}
