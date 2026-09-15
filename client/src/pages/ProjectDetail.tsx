import { ArrowLeft, ArrowUpRight, FolderOpen, Loader2 } from "lucide-react";
import { Link, useRoute } from "wouter";
import { PageIntro, PublicLayout, usePageMeta } from "@/components/PublicLayout";
import { trpc } from "@/lib/trpc";

export default function ProjectDetail() {
  const [, params] = useRoute<{ slug: string }>("/work/:slug");
  const project = trpc.projects.bySlug.useQuery({ slug: params?.slug ?? "" }, { enabled: Boolean(params?.slug) });
  usePageMeta(project.data?.title ?? "Project", project.data?.summary ?? "A project from EFEN's community-powered work.");
  if (project.isLoading) return <PublicLayout><div className="detail-loading"><Loader2 className="spin" /> Loading project</div></PublicLayout>;
  if (!project.data) return <PublicLayout><div className="detail-loading"><h1>Project not found</h1><Link className="text-button" href="/work"><ArrowLeft size={16} /> Back to our work</Link></div></PublicLayout>;
  return <PublicLayout><main><PageIntro eyebrow={project.data.category} title={<>{project.data.title}</>} copy={project.data.summary} /><section className="project-detail-section"><div className="container project-detail-grid"><div className="project-detail-visual"><FolderOpen size={38} /><span>EFEN project / {String(project.data.id).padStart(2, "0")}</span></div><div><span className="eyebrow"><i className="eyebrow-line" /> Project detail</span><h2>Building a practical pathway from connection to change.</h2><p className="lead-copy">{project.data.detail}</p><p>EFEN's approach is grounded in listening, relationship-building and action alongside the people and communities closest to the opportunity.</p><Link className="button button-dark" href="/involved">Connect around this work <ArrowUpRight size={16} /></Link></div></div></section></main></PublicLayout>;
}
