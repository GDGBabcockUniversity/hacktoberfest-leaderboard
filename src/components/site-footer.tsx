import Link from "next/link";
import { FaInstagram, FaTiktok, FaXTwitter } from "react-icons/fa6";

const socials = [
  { name: "TikTok", href: "https://www.tiktok.com/@gdgbabcock", Icon: FaTiktok },
  { name: "Instagram", href: "https://www.instagram.com/gdgbabcock/", Icon: FaInstagram },
  { name: "X", href: "https://x.com/gdgbabcock", Icon: FaXTwitter },
];

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="site-footer-inner">
        <Link className="site-footer-home" href="https://gdgbabcock.com" target="_blank" rel="noreferrer">
          gdgbabcock.com <span aria-hidden="true">↗</span>
        </Link>
        <nav className="site-footer-socials" aria-label="GDG Babcock social media">
          {socials.map((social) => (
            <a key={social.name} href={social.href} target="_blank" rel="noreferrer" aria-label={`${social.name}: @gdgbabcock`}>
              <social.Icon className="site-footer-social-icon" aria-hidden="true" />
            </a>
          ))}
        </nav>
      </div>
    </footer>
  );
}
