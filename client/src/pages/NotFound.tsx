import { ArrowLeft, ArrowUpRight, Compass } from "lucide-react";
import { Link } from "wouter";
import { PublicLayout, usePageMeta } from "@/components/PublicLayout";

export default function NotFound() {
  usePageMeta("Page not found", "This EFEN page could not be found.");
  return <PublicLayout><main className="not-found-page"><div className="brand-pattern" /><div className="not-found-mark"><Compass size={27} /></div><span className="eyebrow"><i className="eyebrow-line" /> 404 / connection interrupted</span><h1>This page took a different route.</h1><p>The address may be outdated, or the page may not be part of the EFEN network yet.</p><div className="not-found-actions"><Link className="button button-dark" href="/">Return home <ArrowUpRight size={16} /></Link><Link className="text-button" href="/work"><ArrowLeft size={16} /> Explore our work</Link></div></main></PublicLayout>;
}
