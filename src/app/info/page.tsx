import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const scoring = [
  { label: "Standard merged PR", points: "1 point", detail: "Every eligible merged pull request starts at one point." },
  { label: "Intermediate label", points: "2 points", detail: "A PR with the intermediate label earns two points." },
  { label: "Hard label", points: "3 points", detail: "A PR with the hard label earns three points." },
];

export default function InfoPage() {
  return (
    <main className="info-page">
      <header className="info-hero">
        <Badge variant="secondary">OPEN SOURCE · COMMUNITY · LEARNING</Badge>
        <h1>Hacktoberfest, together.</h1>
        <p>
          Hacktoberfest is a global celebration of open source each October. It brings
          people together to learn, build, share ideas, and make software more open.
        </p>
        <Button asChild>
          <a href="https://hacktoberfest.com/" target="_blank" rel="noreferrer">
            Explore official Hacktoberfest <span aria-hidden="true">↗</span>
          </a>
        </Button>
      </header>

      <section className="info-grid" aria-label="About Hacktoberfest and this leaderboard">
        <Card>
          <CardHeader>
            <CardTitle>What is Hacktoberfest?</CardTitle>
            <CardDescription>A chance to take part in the open source community.</CardDescription>
          </CardHeader>
          <CardContent>
            <p>
              Open source grows when people learn together and share work anyone can
              inspect, use, and improve. Hacktoberfest creates space for that through
              community events and hands-on projects. The official 2026 program puts
              particular focus on learning and building with open source AI.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>About this leaderboard</CardTitle>
            <CardDescription>A local view of contributions to participating projects.</CardDescription>
          </CardHeader>
          <CardContent>
            <p>
              This community leaderboard follows merged pull requests in the GitHub
              repositories selected by the organizers. It is a local community activity
              tracker; it does not determine official Hacktoberfest participation,
              milestones, or rewards. Check the official Hacktoberfest site for current
              program details.
            </p>
          </CardContent>
        </Card>
      </section>

      <section className="info-section">
        <div className="info-section-heading">
          <Badge variant="outline">HOW RANKING WORKS</Badge>
          <h2>Contributions, counted from GitHub</h2>
          <p>Scores come from synced GitHub activity and the trivia rounds hosted by the community.</p>
        </div>

        <div className="info-grid info-grid-scoring">
          {scoring.map((item) => (
            <Card key={item.label}>
              <CardHeader>
                <CardTitle>{item.label}</CardTitle>
                <CardDescription>{item.points}</CardDescription>
              </CardHeader>
              <CardContent><p>{item.detail}</p></CardContent>
            </Card>
          ))}
        </div>

        <Card className="info-rules">
          <CardHeader><CardTitle>What counts?</CardTitle></CardHeader>
          <CardContent>
            <ul>
              <li>Pull requests must be merged in the organizer-configured date range and a watched repository.</li>
              <li>Bot accounts and configured maintainers are excluded.</li>
              <li>Pull requests labeled invalid or spam are excluded.</li>
              <li>Trivia scores contribute to the overall board using the configured scoring weights.</li>
              <li>When contribution totals tie, the more recent eligible contribution ranks first.</li>
            </ul>
          </CardContent>
        </Card>
      </section>

      <footer className="info-footer">
        <p>Explore the community’s current rankings and participating repositories.</p>
        <div>
          <Button asChild variant="outline"><Link href="/contributors">Meet the contributors</Link></Button>
          <Button asChild variant="outline"><Link href="/repos">Browse repositories</Link></Button>
        </div>
      </footer>
    </main>
  );
}
