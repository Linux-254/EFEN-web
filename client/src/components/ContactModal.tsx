import { FormEvent, ReactNode, useMemo, useState } from "react";
import { ArrowUpRight, Loader2, Mail } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { professionalRoleLabels, type ContactRole } from "../../../shared/siteContent";

const roles: Array<{ value: ContactRole; description: string }> = [
  { value: "general", description: "A general question or the best place to start." },
  { value: "member", description: "Membership, participation and community connection." },
  { value: "volunteer", description: "Offering time, skills or local knowledge." },
  { value: "partner", description: "Partnerships, institutional support and collaboration." },
  { value: "opportunity", description: "Jobs, mentorship, training or other opportunities." },
];

const defaultMessage: Record<ContactRole, string> = {
  general: "I would like to get in touch with EFEN.",
  member: "I would like to learn more about becoming an EFEN member.",
  volunteer: "I would like to explore volunteering with EFEN.",
  partner: "I would like to explore a partnership with EFEN.",
  opportunity: "I would like to share an opportunity with EFEN.",
};

export default function ContactModal({ trigger }: { trigger: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [role, setRole] = useState<ContactRole>("general");
  const [form, setForm] = useState({ name: "", email: "", organization: "", message: defaultMessage.general, website: "" });
  const settings = trpc.site.settings.useQuery(undefined, { enabled: open });
  const submit = trpc.site.submit.useMutation({
    onSuccess: () => {
      toast.success("Message sent", { description: "Thank you. EFEN will review your message and respond." });
      setForm({ name: "", email: "", organization: "", message: defaultMessage[role], website: "" });
      setOpen(false);
    },
    onError: () => toast.error("Message could not be sent", { description: "Please check your details and try again." }),
  });
  const contact = settings.data?.contact;
  const recipient = useMemo(() => contact?.professionalEmails?.find((item) => item.role === role && item.email)?.email || contact?.professionalEmails?.find((item) => item.role === "general" && item.email)?.email || contact?.email || "", [contact, role]);
  const mailto = recipient ? `mailto:${recipient}?subject=${encodeURIComponent(`EFEN — ${professionalRoleLabels[role]}`)}&body=${encodeURIComponent(form.message)}` : "";
  const updateRole = (value: ContactRole) => {
    setRole(value);
    setForm((current) => ({ ...current, message: defaultMessage[value] }));
  };
  const update = (key: keyof typeof form, value: string) => setForm((current) => ({ ...current, [key]: value }));
  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    submit.mutate({ type: role === "opportunity" ? "opportunity" : "contact", pathway: role, name: form.name, email: form.email, phone: "", organization: form.organization, message: form.message, website: form.website });
  };
  return <Dialog open={open} onOpenChange={setOpen}><DialogTrigger asChild>{trigger}</DialogTrigger><DialogContent className="contact-modal"><DialogHeader><span className="eyebrow"><i className="eyebrow-line" /> Direct contact</span><DialogTitle>Start the right conversation.</DialogTitle><DialogDescription>Select the EFEN team role that best fits your message. The available professional address will be used for the direct email action.</DialogDescription></DialogHeader><form className="contact-modal-form" onSubmit={handleSubmit}><label>Who would you like to reach?<select value={role} onChange={(event) => updateRole(event.target.value as ContactRole)}>{roles.map((item) => <option value={item.value} key={item.value}>{professionalRoleLabels[item.value]}</option>)}</select><small>{roles.find((item) => item.value === role)?.description}</small></label><div className="form-fields-two"><label>Your name<input value={form.name} onChange={(event) => update("name", event.target.value)} required /></label><label>Email address<input type="email" value={form.email} onChange={(event) => update("email", event.target.value)} required /></label></div><label>Organization <span>(optional)</span><input value={form.organization} onChange={(event) => update("organization", event.target.value)} /></label><label>Message<textarea rows={5} value={form.message} onChange={(event) => update("message", event.target.value)} required /></label><label className="form-honeypot" aria-hidden="true">Website<input tabIndex={-1} autoComplete="off" value={form.website} onChange={(event) => update("website", event.target.value)} /></label><div className="contact-modal-recipient">{recipient ? <><Mail size={16} /><span>Routes to <strong>{recipient}</strong></span></> : <><Mail size={16} /><span>The selected professional email is not configured yet.</span></>}</div><div className="contact-modal-actions"><button className="button button-light" type="button" onClick={() => setOpen(false)}>Cancel</button><button className="button button-dark" type="submit" disabled={submit.isPending}>{submit.isPending ? <><Loader2 className="spin" size={16} /> Sending…</> : <>Send message <ArrowUpRight size={16} /></>}</button>{mailto && <a className="text-button" href={mailto}>Open email <ArrowUpRight size={15} /></a>}</div></form></DialogContent></Dialog>;
}
