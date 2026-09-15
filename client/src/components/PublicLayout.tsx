import { useEffect } from "react";
import { ArrowUpRight, Facebook, Instagram, Linkedin, MapPin, MessageCircle, Twitter } from "lucide-react";
import { Link, useLocation } from "wouter";
import { toast } from "sonner";

export const logoPath = "/manus-storage/efen-logo-transparent_d5106309.png";
export const lightLogoPath = "/manus-storage/efen-logo-light_d111099a.png";

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
          <span>EFEN <i /> Soroti, Uganda</span>
        </Link>
        <nav className="public-nav" aria-label="Primary navigation">
          {navItems.map(([label, href]) => <Link href={href} className={location === href ? "active" : ""} key={href}>{label}</Link>)}
        </nav>
        <Link href="/involved" className="public-header-cta">Start a connection <ArrowUpRight size={15} /></Link>
      </div>
    </header>
  );
}

export function SocialPlaceholder({ label, children }: { label: string; children: React.ReactNode }) {
  return <button className="social-link" type="button" aria-label={`${label} link coming soon`} onClick={() => toast(`${label} link will be added when EFEN confirms the official account.`)}>{children}</button>;
}

export function PublicFooter() {
  return (
    <footer className="public-footer">
      <div className="container public-footer-main">
        <div className="public-footer-brand">
          <img src={lightLogoPath} alt="Eminent Friends Empowerment Network" />
          <p>Building stronger social connections and networks that empower people and communities to prosper.</p>
          <div className="footer-socials" aria-label="EFEN social links">
            <SocialPlaceholder label="Facebook"><Facebook size={15} /></SocialPlaceholder>
            <SocialPlaceholder label="LinkedIn"><Linkedin size={15} /></SocialPlaceholder>
            <SocialPlaceholder label="X"><Twitter size={15} /></SocialPlaceholder>
            <SocialPlaceholder label="Instagram"><Instagram size={15} /></SocialPlaceholder>
            <SocialPlaceholder label="WhatsApp"><MessageCircle size={15} /></SocialPlaceholder>
          </div>
        </div>
        <div className="public-footer-links"><span>Explore</span><Link href="/about">About EFEN</Link><Link href="/work">Our work</Link><Link href="/faqs">FAQs</Link></div>
        <div className="public-footer-links"><span>Participate</span><Link href="/involved">Get involved</Link><Link href="/involved?type=partner">Partner with EFEN</Link><Link href="/safeguarding">Safeguarding</Link></div>
        <div className="public-footer-location"><MapPin size={16} /><span>Head office<br /><strong>Soroti City, Eastern Uganda</strong></span></div>
      </div>
      <div className="container public-footer-bottom"><span>© EFEN — Eminent Friends Empowerment Network</span><span>Connect. Empower. Transform.</span><Link href="/privacy">Privacy &amp; safeguarding</Link></div>
    </footer>
  );
}

export function PublicLayout({ children }: { children: React.ReactNode }) {
  return <div className="public-site"><PublicHeader />{children}<PublicFooter /></div>;
}

export function PageIntro({ eyebrow, title, copy, dark = false }: { eyebrow: string; title: React.ReactNode; copy: string; dark?: boolean }) {
  return <section className={`page-intro ${dark ? "page-intro-dark" : ""}`}><div className="brand-pattern" /><div className="container page-intro-inner"><div className="eyebrow"><span className="eyebrow-line" /> {eyebrow}</div><h1>{title}</h1><p>{copy}</p></div></section>;
}
