import { ArrowDownRight, ArrowUpRight, Handshake, Network, Sparkles, UsersRound } from "lucide-react";
import { Link } from "wouter";
import { PublicLayout, logoPath, usePageMeta } from "@/components/PublicLayout";
import { trpc } from "@/lib/trpc";
import teamImage from "@/assets/efen-comm2.jpeg";

export default function Landing() {
  usePageMeta("Connect. Empower. Transform.", "Eminent Friends Empowerment Network connects people to skills, opportunities, mentors and networks in Soroti, Eastern Uganda.");
  const settings = trpc.site.settings.useQuery();
  const about = settings.data?.about;
  const hasTeamImage = true;
  const teamTitle = about?.teamIntroTitle || "A network in motion";
  const teamCaption = about?.teamIntroCaption || "Connect. Empower. Transform.";

  return <PublicLayout>
    <main className="landing-page">
      <section className="landing-hero">
        <div className="brand-pattern pattern-hero" />
        <div className="container landing-hero-grid">
          <div className="landing-hero-copy"><h1>Where a <em>connection</em> becomes a way forward.</h1><p>EFEN connects people to skills, opportunities, mentors and networks that turn potential into progress.</p><div className="landing-actions"><Link className="button button-light" href="/about">Learn about EFEN <ArrowDownRight size={17} /></Link><Link className="text-button light-text" href="/involved">Find your way in <ArrowUpRight size={16} /></Link></div><div className="landing-location">Stronger connections. More possible futures.</div></div>
          <div className="landing-hero-object">
            <div className="object-label">{teamTitle}</div>
            {hasTeamImage ? (
              <div className="landing-team-frame">
                <img src={about?.teamIntroImageUrl || teamImage} alt="EFEN community members joining hands" className="landing-team-photo" />
                <div className="landing-team-overlay" />
              </div>
            ) : (
              <div className="landing-network">
                <div className="network-center" aria-hidden="true"><Network size={23} /></div>
                <i className="network-dot dot-1" />
                <i className="network-dot dot-2" />
                <i className="network-dot dot-3" />
                <i className="network-dot dot-4" />
                <span className="network-label label-a">skills</span>
                <span className="network-label label-b">mentors</span>
                <span className="network-label label-c">opportunity</span>
              </div>
            )}
            <div className="landing-logo-card">
              <img src={logoPath} alt="EFEN" />
              <span>{teamCaption}</span>
            </div>
          </div>
        </div>
      </section>
      <section className="landing-summary landing-summary-emphasis"><div className="container landing-summary-grid"><div><span className="eyebrow"><i className="eyebrow-line" /> INTRO</span><h2>Stronger social connections can create stronger communities.</h2></div><div><p className="lead-copy">Many people already have skills, ideas, energy and potential. EFEN helps connect that potential to relationships, information, resources and opportunity.</p><p>We work alongside young people, women and girls, children, persons with disabilities and marginalized communities to build a more inclusive, resilient and prosperous future.</p><Link className="text-button" href="/about">Read the EFEN story <ArrowUpRight size={16} /></Link></div></div></section>
      <section className="landing-pillars"><div className="container"><div className="section-heading-simple"><span className="eyebrow"><i className="eyebrow-line" /></span><h2>One shared direction, many ways to participate.</h2></div><div className="pillar-grid"><div><UsersRound size={21} /><strong>Connect</strong><span>Meaningful relationships and networks.</span></div><div><Sparkles size={21} /><strong>Empower</strong><span>Skills, confidence and opportunity.</span></div><div><Handshake size={21} /><strong>Act</strong><span>Communities becoming stronger together.</span></div></div><div className="landing-more"><Link className="button button-dark" href="/work">See our work <ArrowUpRight size={16} /></Link><Link className="text-button" href="/faqs">Questions? Visit FAQs <ArrowUpRight size={16} /></Link></div></div></section>
    </main>
  </PublicLayout>;
}
