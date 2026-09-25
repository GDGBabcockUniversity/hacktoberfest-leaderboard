"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";

export function Navigation() {
  const path = usePathname();
  return <header className="site-header"><div className="header-inner">
    <Link href="/" className="brand" aria-label="GDG Babcock University home"><span className="brand-logo-wrap"><Image src="/gdg-logo.png" alt="Google Developer Group Babcock University" width={1920} height={390} className="brand-logo" priority /></span></Link>
    <nav aria-label="Main navigation">{[["/", "Overview"], ["/contributors", "Contributors"], ["/repos", "Repositories"], ["/trivia", "Trivia"], ["/info", "Info"]].map(([href, label]) => <Link key={href} href={href} aria-current={(href === "/" ? path === href : path.startsWith(href)) ? "page" : undefined}>{label}</Link>)}</nav>
    <Button asChild variant="outline" size="sm"><Link href="/admin" className="admin-link">Admin <span>↗</span></Link></Button>
  </div></header>;
}
