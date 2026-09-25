import "./globals.css";
import type { Metadata } from "next";
import { Navigation } from "@/components/navigation";
import { SiteFooter } from "@/components/site-footer";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined);

export const metadata: Metadata = {
  ...(siteUrl ? { metadataBase: new URL(siteUrl) } : {}),
  title: {
    default: "Hacktoberfest Leaderboard | GDG Babcock University",
    template: "%s | GDG Babcock University",
  },
  description:
    "Follow Hacktoberfest contributions, pull requests, trivia scores, and community rankings at GDG Babcock University.",
  applicationName: "Hacktoberfest Leaderboard",
  keywords: [
    "Hacktoberfest",
    "GDG Babcock University",
    "open source",
    "GitHub",
    "leaderboard",
    "developer community",
  ],
  authors: [{ name: "GDG Babcock University", url: "https://gdgbabcock.com" }],
  creator: "GDG Babcock University",
  publisher: "GDG Babcock University",
  category: "Technology",
  robots: { index: true, follow: true },
  icons: { icon: "/gdg-logo.png" },
  openGraph: {
    type: "website",
    locale: "en_NG",
    siteName: "GDG Babcock University",
    title: "Hacktoberfest Leaderboard | GDG Babcock University",
    description:
      "Follow Hacktoberfest contributions, pull requests, trivia scores, and community rankings.",
    images: [
      {
        url: "/gdg-logo.png",
        width: 1920,
        height: 390,
        alt: "Google Developer Group Babcock University",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Hacktoberfest Leaderboard | GDG Babcock University",
    description:
      "Follow Hacktoberfest contributions, pull requests, trivia scores, and community rankings.",
    images: ["/gdg-logo.png"],
  },
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
