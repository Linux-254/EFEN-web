import { FormEvent, useMemo, useState } from "react";
import { ArrowUpRight, CheckCircle2, Handshake, Loader2, Mail, MessageCircle, Send, Sparkles, UsersRound } from "lucide-react";
import { Link } from "wouter";
import { PageIntro, PublicLayout, usePageMeta } from "@/components/PublicLayout";
import { trpc } from "@/lib/trpc";

type Pathway = "member" | "volunteer" | "partner" | "opportunity";

const paths: Array<[typeof UsersRound, string, string, Pathway]> = [
  [UsersRound, "Become a member", "Bring your perspective, lived experience and network into a community of people building what is possible.", "member"],
  [Sparkles, "Volunteer", "Share your time, skills, local knowledge or practical support with a project that needs another pair of hands.", "volunteer"],
  [Handshake, "Become a partner", "Build a thoughtful pathway with EFEN, communities and the people closest to the opportunity.", "partner"],
  [Send, "Share an opportunity", "Open a door through a job, mentor, training, market link, resource or connection.", "opportunity"],
];

const labels: Record<Pathway, { title: string; message: string; button: string }> = {
  member: { title: "Tell EFEN how you would like to participate as a member.", message: "I would like to learn more about becoming an EFEN member.", button: "Ask about membership" },
  volunteer: { title: "Offer your time, skills or local knowledge.", message: "I would like to explore volunteering with EFEN.", button: "Ask about volunteering" },
  partner: { title: "Build a thoughtful partnership with EFEN.", message: "I would like to explore a partnership with EFEN.", button: "Start a partnership conversation" },
  opportunity: { title: "Bring an opportunity into the network.", message: "I would like to share an opportunity with EFEN.", button: "Share the opportunity" },
};

const cleanWhatsApp = (value: string) => value.replace(/[^\d]/g, "");

export default function Involved() {
  usePageMeta("Get involved", "Find a way to participate in EFEN's community-powered work as a member, volunteer, partner or opportunity holder.");
  const queryPath = new URLSearchParams(window.location.search).get("type");
  const initialPathway: Pathway = queryPath === "member" || queryPath === "volunteer" || queryPath === "partner" ? queryPath : "opportunity";
  const [pathway, setPathway] = useState<Pathway>(initialPathway);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState(() => ({ name: "", email: "", phone: "", organization: "", message: labels[initialPathway].message, website: "" }));
  const settings = trpc.site.settings.useQuery();
  const submit = trpc.site.submit.useMutation({ onSuccess: () => { setSubmitted(true); setForm({ name: "", email: "", phone: "", organization: "", message: "", website: "" }); } });
  const contact = settings.data?.contact;
  const config = labels[pathway];
  const message = useMemo(() => `${config.message}\n\nName: ${form.name || "[Your name]"}\nEmail: ${form.email || "[Your email]"}\nOrganization: ${form.organization || "[Optional]"}\n\n${form.message || "[Add a little more detail here]"}`, [config.message, form]);
  const choose = (nextPath: Pathway) => { setPathway(nextPath); setSubmitted(false); window.setTimeout(() => document.getElementById("involved-form")?.scrollIntoView({ behavior: "smooth", block: "start" }), 0); };
  const update = (key: keyof typeof form, value: string) => setForm((current) => ({ ...current, [key]: value }));
  const handleSubmit = (event: FormEvent) => { event.preventDefault(); submit.mutate({ type: pathway === "opportunity" ? "opportunity" : "contact", pathway, ...form }); };
  const whatsappHref = contact?.whatsapp ? `https://wa.me/${cleanWhatsApp(contact.whatsapp)}?text=${encodeURIComponent(message)}` : "";
  const mailHref = contact?.email ? `mailto:${contact.email}?subject=${encodeURIComponent(`EFEN — ${pathway}`)}&body=${encodeURIComponent(message)}` : "";
  return <PublicLayout><main><PageIntro eyebrow="Get involved" title={<>There is a place for your <em>yes.</em></>} copy="Whether you bring time, expertise, resources or an opportunity, your next connection can help someone move forward." /><section className="involved-page-section"><div className="container involved-page-grid">{paths.map(([Icon, title, copy, path]) => <article className={`involved-page-card ${pathway === path ? "selected" : ""}`} key={title}><div className="involved-card-number">0{paths.findIndex((item) => item[1] === title) + 1}</div><Icon size={24} /><h2>{title}</h2><p>{copy}</p><button className="text-button" onClick={() => choose(path)}>Choose this pathway <ArrowUpRight size={16} /></button></article>)}</div></section><section className="involved-form-section" id="involved-form"><div className="container involved-form-grid"><div className="involved-form-intro"><span className="eyebrow"><i className="eyebrow-line" /> Start a connection</span><h2>{config.title}</h2><p>Your message will be saved securely for the EFEN administrator to review. No account is required.</p><div className="official-contact-preview">{contact?.email ? <a href={mailHref}><Mail size={16} /> Email EFEN</a> : <span><Mail size={16} /> Official email to be confirmed</span>}{contact?.whatsapp ? <a href={whatsappHref} target="_blank" rel="noreferrer"><MessageCircle size={16} /> WhatsApp EFEN</a> : <span><MessageCircle size={16} /> WhatsApp contact to be confirmed</span>}{contact?.phone && <span><span className="contact-separator" /> {contact.phone}</span>}</div><div className="direct-contact-actions">{mailHref && <a className="button button-light" href={mailHref}>Email this request <ArrowUpRight size={16} /></a>}{whatsappHref && <a className="button button-dark" href={whatsappHref} target="_blank" rel="noreferrer">Open WhatsApp <MessageCircle size={16} /></a>}</div></div><div className="involved-form-card">{submitted ? <div className="form-success"><CheckCircle2 size={34} /><h3>Thank you. Your connection is in.</h3><p>The EFEN team can now review your message from the private content studio.</p><button className="button button-dark" onClick={() => setSubmitted(false)}>Send another message</button></div> : <form onSubmit={handleSubmit}><div className="form-type-toggle">{paths.map(([, title, , path]) => <button key={path} type="button" className={pathway === path ? "active" : ""} onClick={() => setPathway(path)}>{title}</button>)}</div><div className="form-fields-two"><label>Your name<input value={form.name} onChange={(e) => update("name", e.target.value)} required /></label><label>Email address<input type="email" value={form.email} onChange={(e) => update("email", e.target.value)} required /></label><label>Phone <span>(optional)</span><input value={form.phone} onChange={(e) => update("phone", e.target.value)} /></label><label>Organization <span>(optional)</span><input value={form.organization} onChange={(e) => update("organization", e.target.value)} /></label></div><label>Message<textarea rows={6} value={form.message} onChange={(e) => update("message", e.target.value)} placeholder={config.message} required /></label><label className="form-honeypot" aria-hidden="true">Website<input tabIndex={-1} autoComplete="off" value={form.website} onChange={(e) => update("website", e.target.value)} /></label><button className="button button-dark" type="submit" disabled={submit.isPending}>{submit.isPending ? <><Loader2 className="spin" size={16} /> Sending…</> : <>{config.button} <ArrowUpRight size={16} /></>}</button>{submit.error && <span className="form-error">We could not save this message. Please try again.</span>}</form>}</div></div></section><section className="partner-band"><div className="container partner-band-grid"><div><span className="eyebrow light"><i className="eyebrow-line" /> A useful next step</span><h2>Participation should feel safe, respectful and accessible.</h2></div><div><p>Read the questions people ask most often, or review EFEN's safeguarding commitments before you connect.</p><Link className="button button-light" href="/faqs">Read common questions <ArrowUpRight size={16} /></Link></div></div></section></main></PublicLayout>;
}
