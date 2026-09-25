import { liveLeaderboard } from "@/lib/live-leaderboard";
import { Leaderboard } from "@/components/leaderboard";
export const dynamic = "force-dynamic";
export default async function Contributors() {
  return <Leaderboard initial={await liveLeaderboard("contributors")} mode="contributors" />;
}
