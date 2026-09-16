import { useEffect } from "react";
import { ArrowUpRight, Facebook, Instagram, Linkedin, MapPin, MessageCircle, Twitter } from "lucide-react";
import { Link, useLocation } from "wouter";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { defaultSocialLinks } from "../../../shared/siteContent";
import logoAsset from "@/assets/efen-logo-transparent.png";
import lightLogoAsset from "@/assets/efen-logo-light.png";

export const logoPath = logoAsset;
export const lightLogoPath = lightLogoAsset;

const navItems = [
  ["About", "/about"],
  ["Our work", "/work"],
  ["Get involved", "/involved"],
  ["FAQs", "/faqs"],
] as const;

export function usePageMeta(title: string, description: string) {
  useEffect(() => {
    document.title = `${title} | EFEN`;
    const descriptionTag = document.querySelector('meta[name="description"]');
    descriptionTag?.setAttribute("content", description);
  }, [title, description]);
}

export function PublicHeader() {
  const [location] = useLocation();
  return (
    <header className={`public-header ${location === "/" ? "public-header-dark" : "public-header-light"}`}>
      <div className="container public-header-inner">
        <Link href="/" className="public-brand" aria-label="EFEN home">
          <img src={location === "/" ? lightLogoPath : logoPath} alt="Eminent Friends Empowerment Network" />
          <span className="public-brand-name">EFEN</span>
        </Link>
        <nav className="public-nav" aria-label="Primary navigation">
          {navItems.map(([label, href]) => <Link href={href} className={location === href ? "active" : ""} key={href}>{label}</Link>)}
        </nav>
        <Link href="/involved?type=opportunity" className="public-header-cta">Start a connection <ArrowUpRight size={15} /></Link>
      </div>
    </header>
  );
}

export function SocialPlaceholder({ label, url, children }: { label: string; url?: string; children: React.ReactNode }) {
  if (url) return <a className="social-link" href={url} target="_blank" rel="noreferrer" aria-label={`EFEN on ${label}`}>{children}</a>;
  return <button className="social-link" type="button" aria-label={`${label} link coming soon`} onClick={() => toast(`${label} link will be added when EFEN confirms the official account.`)}>{children}</button>;
}

// Inline TikTok SVG icon since Lucide doesn't include it
function TikTokIcon({ size = 15 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.2 8.2 0 0 0 4.78 1.52V6.77a4.85 4.85 0 0 1-1.01-.08z"/>
    </svg>
  );
}

function socialIcon(platform: string) {
  const key = platform.toLowerCase();
  if (key.includes("facebook")) return <Facebook size={15} />;
  if (key.includes("linkedin")) return <Linkedin size={15} />;
  if (key === "x" || key.includes("twitter")) return <Twitter size={15} />;
  if (key.includes("instagram")) return <Instagram size={15} />;
  if (key.includes("tiktok")) return <TikTokIcon size={15} />;
  return <MessageCircle size={15} />;
}

export function PublicFooter() {
  const settings = trpc.site.settings.useQuery();
  const contact = settings.data?.contact;
  const socialLinks = settings.data?.socialLinks?.length ? settings.data.socialLinks : defaultSocialLinks;
  return (
    <footer className="public-footer">
      <div className="container public-footer-main">
        <div className="public-footer-brand">
          <img src={lightLogoPath} alt="Eminent Friends Empowerment Network" />
          <p>Building stronger social connections and networks that empower people and communities to prosper.</p>
          <div className="footer-socials" aria-label="EFEN social links">
            {socialLinks.map((link) => <SocialPlaceholder key={link.platform} label={link.platform} url={link.url}>{socialIcon(link.platform)}</SocialPlaceholder>)}
          </div>
        </div>
        <div className="public-footer-links"><span>Explore</span><Link href="/about">About EFEN</Link><Link href="/work">Our work</Link><Link href="/faqs">FAQs</Link></div>
        <div className="public-footer-links"><span>Participate</span><Link href="/involved">Get involved</Link><Link href="/involved?type=partner">Partner with EFEN</Link><Link href="/safeguarding">Safeguarding</Link></div>
        <div className="public-footer-location"><MapPin size={16} /><span>Head office<br /><strong>{contact?.address || "Soroti City, Eastern Uganda"}</strong>{contact?.email && <><br /><a href={`mailto:${contact.email}`}>{contact.email}</a></>}{contact?.phone && <><br /><a href={`tel:${contact.phone}`}>{contact.phone}</a></>}{contact?.whatsapp && <><br /><a href={`https://wa.me/${contact.whatsapp.replace(/\D/g, "")}`} target="_blank" rel="noreferrer">WhatsApp EFEN</a></>}</span></div>
      </div>
      <div className="container public-footer-bottom"><span>© EFEN — Eminent Friends Empowerment Network</span><span>Connect. Empower. Transform.</span><Link href="/privacy">Privacy &amp; safeguarding</Link></div>
    </footer>
  );
}

export function PublicLayout({ children }: { children: React.ReactNode }) {
  return <div className="public-site"><PublicHeader />{children}<PublicFooter /></div>;
}

export function PageIntro({ eyebrow, title, copy, dark = false }: { eyebrow: string; title: React.ReactNode; copy: string; dark?: boolean }) {
  return <section className={`page-intro ${dark ? "page-intro-dark" : ""}`}><div className="brand-pattern" /><div className="container page-intro-inner">{eyebrow && <div className="eyebrow"><span className="eyebrow-line" /> {eyebrow}</div>}<h1>{title}</h1><p>{copy}</p></div></section>;
}
