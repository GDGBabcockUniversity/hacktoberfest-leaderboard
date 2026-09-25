import { liveLeaderboard } from "@/lib/live-leaderboard";
import { Leaderboard } from "@/components/leaderboard";
export const dynamic = "force-dynamic";

export default async function Home() {
  return <Leaderboard initial={await liveLeaderboard()} mode="overall" />;
}
