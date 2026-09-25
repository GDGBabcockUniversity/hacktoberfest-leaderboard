"use client";
import { saveScore } from "@/lib/actions";
import { Input } from "@/components/ui/input";
type Person = {
  id: number;
  displayName: string;
  roundScores: Map<number, number>;
};
type Round = { id: number; name: string };
export function ScoreGrid({
  people,
  rounds,
}: {
  people: Person[];
  rounds: Round[];
}) {
  return (
    <div className="overflow-x-auto">
      <table>
        <thead>
          <tr>
            <th>Participant</th>
            {rounds.map((r) => (
              <th key={r.id}>{r.name}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {people.map((p) => (
            <tr key={p.id}>
              <td>{p.displayName}</td>
              {rounds.map((r) => (
                <td key={r.id}>
                  <Input
                    className="w-16"
                    type="number"
                    defaultValue={p.roundScores.get(r.id) || 0}
                    onBlur={(e) =>
                      saveScore(p.id, r.id, Number(e.currentTarget.value || 0))
                    }
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
