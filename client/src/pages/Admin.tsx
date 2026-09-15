import { useState } from "react";
import { ArrowUpRight, Check, Edit3, FolderPlus, LockKeyhole, LogOut, Plus, Save, Trash2, X } from "lucide-react";
import { Link } from "wouter";
import DashboardLayout from "@/components/DashboardLayout";
import { trpc } from "@/lib/trpc";

type ProjectDraft = { slug: string; title: string; summary: string; detail: string; category: string; status: "draft" | "published"; imageUrl: string };
const blank: ProjectDraft = { slug: "", title: "", summary: "", detail: "", category: "Youth empowerment", status: "published", imageUrl: "" };

function PinGate() {
  const [pin, setPin] = useState("");
  const status = trpc.admin.status.useQuery();
  const login = trpc.admin.login.useMutation({ onSuccess: () => status.refetch() });
  return <div className="admin-gate"><div className="admin-gate-pattern" /><div className="admin-gate-card"><div className="admin-lock"><LockKeyhole size={22} /></div><span className="eyebrow"><i className="eyebrow-line" /> Private workspace</span><h1>EFEN content studio</h1><p>This area is for the EFEN administrator. It is not linked from the public navigation and requires a server-verified PIN.</p><form onSubmit={(event) => { event.preventDefault(); login.mutate({ pin }); }}><label htmlFor="admin-pin">Personal PIN</label><input id="admin-pin" type="password" inputMode="numeric" autoComplete="current-password" value={pin} onChange={(event) => setPin(event.target.value)} placeholder="Enter your PIN" /><button className="button button-dark" type="submit" disabled={login.isPending}>{login.isPending ? "Checking…" : "Unlock workspace"} <ArrowUpRight size={16} /></button>{login.data && !login.data.success && <span className="admin-error">That PIN did not unlock this workspace.</span>}</form>{status.data?.previewMode && <div className="admin-preview-note"><strong>Preview demo PIN:</strong> 2468<br /><span>Set EFEN_ADMIN_PIN in Vercel before sharing a production deployment.</span></div>}</div></div>;
}

function ProjectEditor({ project, onClose, onSaved }: { project: ProjectDraft & { id?: number }; onClose: () => void; onSaved: () => void }) {
  const [draft, setDraft] = useState<ProjectDraft>(project);
  const create = trpc.admin.createProject.useMutation({ onSuccess: () => { onSaved(); onClose(); } });
  const update = trpc.admin.updateProject.useMutation({ onSuccess: () => { onSaved(); onClose(); } });
  const isEdit = Boolean(project.id);
  const set = (key: keyof ProjectDraft, value: string) => setDraft((current) => ({ ...current, [key]: value }));
  const save = (event: React.FormEvent) => { event.preventDefault(); if (isEdit) update.mutate({ id: project.id as number, ...draft }); else create.mutate(draft); };
  return <div className="admin-editor-overlay"><form className="admin-editor" onSubmit={save}><div className="admin-editor-head"><div><span className="eyebrow"><i className="eyebrow-line" /> {isEdit ? "Edit project" : "New project"}</span><h2>{isEdit ? "Shape the project story." : "Add a project to the library."}</h2></div><button type="button" className="icon-button" onClick={onClose} aria-label="Close editor"><X size={18} /></button></div><div className="admin-form-grid"><label>Title<input value={draft.title} onChange={(e) => set("title", e.target.value)} required /></label><label>Slug<input value={draft.slug} onChange={(e) => set("slug", e.target.value.toLowerCase().replace(/\s+/g, "-"))} required /></label><label>Category<input value={draft.category} onChange={(e) => set("category", e.target.value)} required /></label><label>Status<select value={draft.status} onChange={(e) => set("status", e.target.value as ProjectDraft["status"])}><option value="published">Published</option><option value="draft">Draft</option></select></label><label className="field-wide">Summary<textarea value={draft.summary} onChange={(e) => set("summary", e.target.value)} rows={3} required /></label><label className="field-wide">Detail<textarea value={draft.detail} onChange={(e) => set("detail", e.target.value)} rows={6} required /></label></div><div className="admin-editor-actions"><button type="button" className="text-button" onClick={onClose}>Cancel</button><button className="button button-dark" type="submit" disabled={create.isPending || update.isPending}><Save size={16} /> {isEdit ? "Save changes" : "Publish project"}</button></div></form></div>;
}

function AdminStudio() {
  const status = trpc.admin.status.useQuery();
  const utils = trpc.useUtils();
  const projects = trpc.admin.projects.useQuery(undefined, { enabled: Boolean(status.data?.authenticated) });
  const remove = trpc.admin.deleteProject.useMutation({ onSuccess: () => utils.admin.projects.invalidate() });
  const logout = trpc.admin.logout.useMutation({ onSuccess: () => status.refetch() });
  const [editing, setEditing] = useState<(ProjectDraft & { id?: number }) | null>(null);
  if (!status.data?.authenticated) return <PinGate />;
  return <DashboardLayout requireUser={false}><div className="admin-dashboard"><div className="admin-dashboard-top"><div><span className="eyebrow"><i className="eyebrow-line" /> Private workspace</span><h1>Content studio</h1><p>Keep the public project library current without touching the codebase.</p></div><div className="admin-dashboard-actions"><Link className="text-button" href="/">View public site <ArrowUpRight size={16} /></Link><button className="admin-logout" onClick={() => logout.mutate()}><LogOut size={15} /> Lock workspace</button></div></div><div className="admin-stats"><div><span>Published / draft library</span><strong>{projects.data?.length ?? 0}</strong></div><div><span>Public pagination</span><strong>3 <small>per page</small></strong></div><div><span>Workspace protection</span><strong><Check size={18} /> PIN</strong></div></div><div className="admin-project-head"><div><span className="eyebrow"><i className="eyebrow-line" /> Projects</span><h2>Project library</h2></div><button className="button button-dark" onClick={() => setEditing(blank)}><FolderPlus size={16} /> Add project</button></div><div className="admin-project-list">{projects.data?.map((project) => <article className="admin-project-row" key={project.id}><div className="admin-project-index">{String(project.id).padStart(2, "0")}</div><div className="admin-project-copy"><div><span className={`project-status ${project.status}`}>{project.status}</span><span className="admin-project-category">{project.category}</span></div><h3>{project.title}</h3><p>{project.summary}</p></div><div className="admin-row-actions"><button onClick={() => setEditing({ id: project.id, slug: project.slug, title: project.title, summary: project.summary, detail: project.detail, category: project.category, status: project.status, imageUrl: project.imageUrl ?? "" })} aria-label={`Edit ${project.title}`}><Edit3 size={16} /></button><button onClick={() => window.confirm(`Delete ${project.title}?`) && remove.mutate({ id: project.id })} aria-label={`Delete ${project.title}`}><Trash2 size={16} /></button></div></article>)}</div>{editing && <ProjectEditor project={editing} onClose={() => setEditing(null)} onSaved={() => utils.admin.projects.invalidate()} />}</div></DashboardLayout>;
}

export default function Admin() {
  return <AdminStudio />;
}
