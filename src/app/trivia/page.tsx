import Link from "next/link";
import { trivia } from "@/lib/queries";
import { Empty, Person } from "@/components/table";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default async function Trivia() {
  const { rounds, rows } = await trivia();
  return (
    <main>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-black">Trivia standings</h1>
      </div>
      {!rounds.length ? (
        <Empty>No trivia rounds yet. Create one from Admin.</Empty>
      ) : (
        <Card className="card">
          <table>
            <thead>
              <tr>
                <th>Rank</th>
                <th>Player</th>
                {rounds.map((r) => (
                  <th key={r.id}>{r.name}</th>
                ))}
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((x) => (
                <tr key={x.githubUsername}>
                  <td>#{x.rank}</td>
                  <td>
                    <Person name={x.displayName} avatar={x.avatarUrl} />
                  </td>
                  {rounds.map((r) => (
                    <td key={r.id}>{x.roundScores.get(r.id) || 0}</td>
                  ))}
                  <td className="font-bold">{x.total}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </main>
  );
}
