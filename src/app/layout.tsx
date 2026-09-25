import "./globals.css";
import { Navigation } from "@/components/navigation";
import { SiteFooter } from "@/components/site-footer";
export const metadata = {
  title: "Hacktoberfest Leaderboard",
  description: "A live leaderboard powered by GitHub contributions",
  icons: { icon: "/gdg-logo.png" },
};
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="light">
      <body>
        <Navigation />
        {children}
        <SiteFooter />
      </body>
    </html>
  );
}
