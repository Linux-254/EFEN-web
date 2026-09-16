import { useState } from "react";
import { ArrowUpRight, ChevronDown, Loader2 } from "lucide-react";
import { Link } from "wouter";
import { PageIntro, PublicLayout, usePageMeta } from "@/components/PublicLayout";
import { trpc } from "@/lib/trpc";
import { defaultFaqs } from "../../../shared/siteContent";

export default function Faqs() {
  const [open, setOpen] = useState(0);
  const settings = trpc.site.settings.useQuery();
  const faqs = settings.data?.faqs ?? defaultFaqs;
  usePageMeta("FAQs", "Frequently asked questions about EFEN, Connect4Change, participation, safeguarding and the communities the network serves.");
  return <PublicLayout><main><PageIntro eyebrow="FAQs" title={<>Good questions make <em>better connections.</em></>} copy="A short, practical guide to EFEN, its focus, participation pathways and the information still to be confirmed." /><section className="faq-section"><div className="container faq-layout"><div><span className="eyebrow"><i className="eyebrow-line" /> </span><h2>Start with what you need to know.</h2><p>Questions and answers can be updated by the EFEN administrator as official information evolves.</p><Link className="text-button" href="/involved">Find a participation path <ArrowUpRight size={16} /></Link></div><div className="faq-list">{settings.isLoading && <div className="loading-state"><Loader2 className="spin" /> Loading FAQs</div>}{!settings.isLoading && faqs.map((faq, index) => <div className={`faq-item ${open === index ? "open" : ""}`} key={`${faq.question}-${index}`}><button onClick={() => setOpen(open === index ? -1 : index)}><span>{faq.question}</span><ChevronDown size={18} /></button>{open === index && <p>{faq.answer}</p>}</div>)}</div></div></section></main></PublicLayout>;
}
