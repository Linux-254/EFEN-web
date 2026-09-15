import { useEffect, useState } from "react";
import {
  ArrowDownRight,
  ArrowUpRight,
  BookOpenCheck,
  Check,
  ChevronDown,
  CircleCheck,
  Compass,
  Handshake,
  HeartHandshake,
  Leaf,
  Lightbulb,
  MapPin,
  Menu,
  Network,
  Send,
  ShieldCheck,
  Sparkles,
  UsersRound,
  X,
} from "lucide-react";
import { toast } from "sonner";

const logoPath = "/manus-storage/efen-logo-transparent_d5106309.png";

const focusAreas = [
  {
    number: "01",
    icon: UsersRound,
    title: "Youth empowerment & leadership",
    copy: "Mentorship, skills development, entrepreneurship, career pathways and youth-led community action.",
    tone: "violet",
  },
  {
    number: "02",
    icon: HeartHandshake,
    title: "Sustainable livelihoods",
    copy: "Practical skills, business development, market linkages and opportunity connections that help people prosper.",
    tone: "gold",
  },
  {
    number: "03",
    icon: Network,
    title: "Inclusive communities",
    copy: "Participation, dignity and access to opportunity for persons with disabilities and marginalized communities.",
    tone: "mint",
  },
  {
    number: "04",
    icon: ShieldCheck,
    title: "Women, children & vulnerable groups",
    copy: "Initiatives that strengthen safety, voice, participation and the everyday opportunities of those most at risk.",
    tone: "rose",
  },
  {
    number: "05",
    icon: Lightbulb,
    title: "Innovation & knowledge",
    copy: "Community-led solutions, research, learning and responsible digital approaches that can be adapted locally.",
    tone: "blue",
  },
  {
    number: "06",
    icon: Leaf,
    title: "Climate action & resilience",
    copy: "Sustainable and locally appropriate ways for communities to respond to environmental and climate-related challenges.",
    tone: "green",
  },
];

const steps = [
  ["01", "Map", "Start with what people already have: strengths, skills, needs and possibilities."],
  ["02", "Connect", "Bring the right people, mentors, institutions and opportunity holders into the room."],
  ["03", "Match", "Turn relationships into practical pathways that feel relevant and reachable."],
  ["04", "Act", "Support people and communities to move from conversation to shared action."],
  ["05", "Measure", "Learn from what changes, what holds and what needs a different approach."],
  ["06", "Scale", "Carry the most useful solutions further through learning and partnership."],
];

const involvement = [
  { icon: UsersRound, label: "Become a member", detail: "Bring your perspective and your network." },
  { icon: Sparkles, label: "Volunteer", detail: "Share your time, skills or local knowledge." },
  { icon: Handshake, label: "Become a partner", detail: "Build a pathway with EFEN and communities." },
  { icon: Send, label: "Share an opportunity", detail: "Open a door for someone ready to grow." },
];

function scrollToId(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

export default function Home() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeInvolvement, setActiveInvolvement] = useState(0);
  const [openSafeguard, setOpenSafeguard] = useState<number | null>(0);
  const [connectionOpen, setConnectionOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 24);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });

    const observer = new IntersectionObserver(
      (entries) => entries.forEach((entry) => entry.isIntersecting && entry.target.classList.add("is-visible")),
      { threshold: 0.12 },
    );
    document.querySelectorAll(".reveal").forEach((item) => observer.observe(item));

    return () => {
      window.removeEventListener("scroll", handleScroll);
      observer.disconnect();
    };
  }, []);

  const showComingSoon = (label: string) => {
    toast(`${label} pathway is ready to connect — official contact details will be added here.`);
  };

  return (
    <div className="site-shell">
      <header className={`site-header ${scrolled ? "site-header-scrolled" : ""}`}>
        <div className="container header-inner">
          <button className="brand-lockup" onClick={() => scrollToId("top")} aria-label="Back to top">
            <img src={logoPath} alt="Eminent Friends Empowerment Network" />
            <span className="brand-caption">EFEN <i /> Soroti, Uganda</span>
          </button>
          <nav className={`desktop-nav ${menuOpen ? "nav-open" : ""}`} aria-label="Primary navigation">
            <button onClick={() => { scrollToId("about"); setMenuOpen(false); }}>About</button>
            <button onClick={() => { scrollToId("work"); setMenuOpen(false); }}>Our work</button>
            <button onClick={() => { scrollToId("connect4change"); setMenuOpen(false); }}>Connect4Change</button>
            <button onClick={() => { scrollToId("safeguarding"); setMenuOpen(false); }}>Safeguarding</button>
          </nav>
          <button className="header-cta" onClick={() => setConnectionOpen(true)}>Start a connection <ArrowUpRight size={16} /></button>
          <button className="mobile-toggle" onClick={() => setMenuOpen((current) => !current)} aria-label={menuOpen ? "Close menu" : "Open menu"}>
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </header>

      <main id="top">
        <section className="hero-section">
          <div className="hero-orb orb-one" />
          <div className="hero-orb orb-two" />
          <div className="container hero-grid">
            <div className="hero-copy reveal">
              <h1>Where a <em>connection</em> becomes a way forward.</h1>
              <p className="hero-lede">EFEN connects people to the skills, opportunities, mentors and networks that turn potential into progress.</p>
              <div className="hero-actions">
                <button className="button button-light" onClick={() => scrollToId("work")}>Explore our work <ArrowDownRight size={17} /></button>
                <button className="text-button light-text" onClick={() => scrollToId("about")}>Why connection matters <ArrowDownRight size={16} /></button>
              </div>
            </div>

            <div className="hero-stage reveal" style={{ transitionDelay: "120ms" }}>
              <div className="stage-grid-lines" />
              <div className="stage-label label-top">a network in motion</div>
              <div className="connection-map" aria-label="An abstract network of people and opportunities">
                <svg viewBox="0 0 540 480" role="img" aria-hidden="true">
                  <defs>
                    <linearGradient id="pathGradient" x1="0" x2="1" y1="0" y2="1">
                      <stop offset="0" stopColor="#a72686" />
                      <stop offset="1" stopColor="#7059ec" />
                    </linearGradient>
                  </defs>
                  <path className="network-path path-one" d="M90 338 C120 222, 176 182, 245 222 S324 358, 388 274 S454 130, 485 94" />
                  <path className="network-path path-two" d="M61 146 C143 98, 174 130, 244 222 S340 276, 422 343" />
                  <path className="network-path path-three" d="M111 403 C197 362, 218 303, 244 222 S346 152, 458 196" />
                  <path className="network-path path-four" d="M160 62 C180 150, 235 166, 244 222 S310 397, 448 420" />
                  <circle className="network-node node-main" cx="244" cy="222" r="20" />
                  <circle className="network-node node-small" cx="90" cy="338" r="9" />
                  <circle className="network-node node-small" cx="485" cy="94" r="9" />
                  <circle className="network-node node-small" cx="61" cy="146" r="9" />
                  <circle className="network-node node-small" cx="422" cy="343" r="9" />
                  <circle className="network-node node-small" cx="160" cy="62" r="9" />
                  <circle className="network-node node-small" cx="448" cy="420" r="9" />
                </svg>
                <div className="network-caption caption-main"><span className="caption-dot" /> people + possibility</div>
                <div className="network-caption caption-one">skills</div>
                <div className="network-caption caption-two">mentors</div>
                <div className="network-caption caption-three">opportunity</div>
              </div>
              <div className="logo-card">
                <img src={logoPath} alt="EFEN logo" />
                <div><strong>Connect. Empower. Transform.</strong><span>A friendship-led network for lasting prosperity.</span></div>
              </div>
              <div className="stage-label label-bottom">01 / 04 — begin with people</div>
            </div>
          </div>
        </section>

        <section className="manifesto-section" id="about">
          <div className="container manifesto-grid">
            <div className="manifesto-intro reveal">
              <div className="eyebrow"><span className="eyebrow-line" /> The EFEN point of view</div>
              <h2>People already carry more potential than the world can see.</h2>
            </div>
            <div className="manifesto-copy reveal" style={{ transitionDelay: "100ms" }}>
              <p className="lead-copy">Sometimes what is missing is not talent — it is a relationship, a piece of information, a resource or an open door.</p>
              <p>EFEN builds bridges between people and opportunity. We bring together communities, young people, professionals, mentors, institutions, businesses and development partners to create practical pathways for empowerment and transformation.</p>
              <button className="text-button" onClick={() => scrollToId("connect4change")}>See our connection model <ArrowUpRight size={16} /></button>
            </div>
          </div>
          <div className="belief-strip reveal">
            <div className="container belief-grid">
              <div className="belief-intro"><span>What we believe</span><small>Four movements. One shared future.</small></div>
              <div className="belief-card"><b>01</b><strong>Connect</strong><span>Meaningful relationships make progress possible.</span></div>
              <div className="belief-card"><b>02</b><strong>Empower</strong><span>Skills, confidence and opportunity create agency.</span></div>
              <div className="belief-card"><b>03</b><strong>Act</strong><span>Communities grow stronger when people act together.</span></div>
              <div className="belief-card"><b>04</b><strong>Transform</strong><span>Sustainable action creates lasting change.</span></div>
            </div>
          </div>
        </section>

        <section className="connect-section" id="connect4change">
          <div className="container connect-grid">
            <div className="connect-copy reveal">
              <div className="eyebrow light"><span className="eyebrow-line" /> Lead project</div>
              <div className="project-kicker">CONNECT<span>4</span>CHANGE</div>
              <h2>A connection is only powerful when it helps someone move.</h2>
              <p>EFEN&apos;s youth-focused innovation model turns social connections into practical pathways to opportunity, mentorship, livelihoods, leadership and community action.</p>
              <button className="button button-outline-light" onClick={() => setConnectionOpen(true)}>Open a pathway <ArrowUpRight size={17} /></button>
            </div>
            <div className="process-card reveal" style={{ transitionDelay: "120ms" }}>
              <div className="process-card-head"><span>How it moves</span><Network size={18} /></div>
              <div className="process-list">
                {steps.map(([number, title, copy], index) => (
                  <div className="process-step" key={title}>
                    <span className="process-number">{number}</span>
                    <div className="process-step-copy"><strong>{title}</strong><p>{copy}</p></div>
                    {index < steps.length - 1 && <div className="process-connector" />}
                  </div>
                ))}
              </div>
              <div className="process-end"><CircleCheck size={15} /> From connections to change.</div>
            </div>
          </div>
        </section>

        <section className="work-section" id="work">
          <div className="container">
            <div className="section-heading reveal">
              <div><div className="eyebrow"><span className="eyebrow-line" /> Where we focus</div><h2>Work that meets people where they are.</h2></div>
              <p>Across empowerment, livelihoods, inclusion, learning and resilience, EFEN creates room for people to participate and prosper.</p>
            </div>
            <div className="focus-grid">
              {focusAreas.map(({ number, icon: Icon, title, copy, tone }, index) => (
                <article className={`focus-card tone-${tone} reveal`} style={{ transitionDelay: `${index * 45}ms` }} key={title}>
                  <div className="focus-top"><span>{number}</span><Icon size={20} strokeWidth={1.8} /></div>
                  <h3>{title}</h3>
                  <p>{copy}</p>
                  <ArrowUpRight className="focus-arrow" size={17} />
                </article>
              ))}
            </div>
            <div className="work-footnote reveal"><span className="work-dot" /> Partnerships &amp; networking are the thread through every focus area.</div>
          </div>
        </section>

        <section className="impact-section">
          <div className="impact-backdrop"><div className="impact-glow" /><div className="impact-ring ring-a" /><div className="impact-ring ring-b" /></div>
          <div className="container impact-grid">
            <div className="impact-statement reveal"><div className="eyebrow light"><span className="eyebrow-line" /> Our impact promise</div><h2>From connections<br /><em>to change.</em></h2><p>We measure the movement from a stronger relationship to a stronger livelihood, a stronger voice and a stronger community.</p></div>
            <div className="impact-metrics reveal" style={{ transitionDelay: "130ms" }}>
              <div className="metric"><strong>01</strong><span>People empowered</span><i /></div>
              <div className="metric"><strong>02</strong><span>Connections strengthened</span><i /></div>
              <div className="metric"><strong>03</strong><span>Livelihoods improved</span><i /></div>
              <div className="metric"><strong>04</strong><span>Communities included</span><i /></div>
              <div className="metric"><strong>05</strong><span>Solutions developed</span><i /></div>
            </div>
          </div>
        </section>

        <section className="involved-section" id="involved">
          <div className="container involved-grid">
            <div className="involved-intro reveal"><div className="eyebrow"><span className="eyebrow-line" /> Get involved</div><h2>There is a place for your yes.</h2><p>Whether you bring time, expertise, resources or an opportunity, your next connection can help someone move forward.</p><div className="involved-quote"><span>“</span><p>We all have something to connect.</p></div></div>
            <div className="involved-panel reveal" style={{ transitionDelay: "120ms" }}>
              <div className="involved-tabs" role="tablist" aria-label="Ways to get involved">
                {involvement.map(({ label }, index) => <button className={activeInvolvement === index ? "active" : ""} onClick={() => setActiveInvolvement(index)} key={label} role="tab" aria-selected={activeInvolvement === index}>{String(index + 1).padStart(2, "0")} <span>{label}</span></button>)}
              </div>
              <div className="involved-detail">
                {(() => { const item = involvement[activeInvolvement]; const Icon = item.icon; return <><div className="involved-icon"><Icon size={26} /></div><div><span className="detail-kicker">EFEN / your role</span><h3>{item.label}</h3><p>{item.detail}</p><button className="button button-dark" onClick={() => showComingSoon(item.label)}>Choose this pathway <ArrowUpRight size={16} /></button></div></>; })()}
              </div>
            </div>
          </div>
        </section>

        <section className="safety-section" id="safeguarding">
          <div className="container safety-grid">
            <div className="safety-list reveal" style={{ transitionDelay: "100ms" }}>
              {["Child protection", "Protection from sexual exploitation, abuse & harassment", "Non-discrimination & safe participation", "Confidential reporting, responsible conduct & data privacy"].map((item, index) => <div className={`safety-item ${openSafeguard === index ? "open" : ""}`} key={item}><button onClick={() => setOpenSafeguard(openSafeguard === index ? null : index)}><span><Check size={15} /> {item}</span><ChevronDown size={18} /></button>{openSafeguard === index && <p>{index === 0 ? "Children deserve environments built around their safety, dignity and best interests." : index === 1 ? "We do not tolerate exploitation, abuse or harassment in any EFEN activity or partnership." : index === 2 ? "Participation should be safe, respectful and accessible to all people." : "People can raise concerns with care, confidentiality and responsible follow-through."}</p>}</div>)}
            </div>
          </div>
        </section>

        <section className="closing-section">
          <div className="container closing-inner reveal"><div className="closing-mark"><div className="closing-dot dot-a" /><div className="closing-dot dot-b" /><div className="closing-line line-a" /><div className="closing-line line-b" /></div><h2>Start with one<br /><em>good connection.</em></h2><p>Stronger social connections and networks empower people and communities to prosper.</p><button className="button button-light" onClick={() => setConnectionOpen(true)}>Start a connection <ArrowUpRight size={17} /></button></div>
        </section>
      </main>

      <footer className="site-footer">
        <div className="container footer-main"><div className="footer-brand"><img src={logoPath} alt="EFEN" /><p>Building stronger social connections and networks that empower people and communities to prosper.</p></div><div className="footer-links"><div><span>Explore</span><button onClick={() => scrollToId("about")}>About EFEN</button><button onClick={() => scrollToId("work")}>Our work</button><button onClick={() => scrollToId("connect4change")}>Connect4Change</button></div><div><span>Participate</span><button onClick={() => scrollToId("involved")}>Get involved</button><button onClick={() => scrollToId("safeguarding")}>Safeguarding</button><button onClick={() => showComingSoon("Feedback")}>Feedback</button></div></div><div className="footer-location"><MapPin size={15} /><span>Head office<br /><strong>Soroti City, Eastern Uganda</strong></span></div></div>
        <div className="container footer-bottom"><span>© EFEN — Eminent Friends Empowerment Network</span><span>Connect. Empower. Transform.</span><span>Website information is an evolving invitation.</span></div>
      </footer>

      {connectionOpen && <div className="connection-overlay" role="dialog" aria-modal="true" aria-labelledby="connection-title" onClick={(event) => event.target === event.currentTarget && setConnectionOpen(false)}><div className="connection-dialog"><button className="dialog-close" onClick={() => setConnectionOpen(false)} aria-label="Close"><X size={19} /></button><div className="eyebrow"><span className="eyebrow-line" /> Start a connection</div><h2 id="connection-title">What would you like to connect around?</h2><p>Choose the closest starting point. EFEN&apos;s official email and telephone contacts are being finalized, so this preview keeps the next step clear without inventing contact details.</p><div className="dialog-options"><button onClick={() => showComingSoon("Joining EFEN")}>I want to join the network <ArrowUpRight size={16} /></button><button onClick={() => showComingSoon("Offering an opportunity")}>I can offer an opportunity <ArrowUpRight size={16} /></button><button onClick={() => showComingSoon("Partnership")}>I want to explore partnership <ArrowUpRight size={16} /></button></div><div className="dialog-note"><BookOpenCheck size={16} /> Official contact details can be added to this panel when available.</div></div></div>}
    </div>
  );
}
