export type FaqItem = { question: string; answer: string };
export type SocialLink = { platform: string; url: string };
export type AboutContent = {
  intro: string;
  purposeTitle: string;
  purposeLead: string;
  purposeBody: string;
  vision: string;
  mission: string;
  valuesTitle: string;
  beliefsTitle: string;
  teamIntroImageUrl?: string;
  teamIntroTitle?: string;
  teamIntroCaption?: string;
};
export type ProjectImageMeta = { url: string; caption: string; alt: string };
export type ContactSettings = {
  email: string;
  phone: string;
  whatsapp: string;
  address: string;
  safeguardingEmail: string;
  safeguardingPhone: string;
};

export const defaultFaqs: FaqItem[] = [
  { question: "What is EFEN?", answer: "Eminent Friends Empowerment Network is a non-profit, non-political, non-sectarian and community-focused organization based in Soroti City, Eastern Uganda." },
  { question: "Who does EFEN work with?", answer: "EFEN works alongside young people, women and girls, children, persons with disabilities, marginalized communities, professionals, mentors, institutions, businesses and development partners." },
  { question: "What is Connect4Change?", answer: "Connect4Change is EFEN's youth-focused innovation model. It helps young people turn social connections into practical pathways to opportunities, mentorship, livelihoods, leadership and community action." },
  { question: "How can I get involved?", answer: "You can become a member, volunteer, partner with EFEN, support the work or share an opportunity. Visit the Get involved page to explore the closest starting point." },
  { question: "Where does EFEN work?", answer: "EFEN's head office is in Soroti City, Eastern Uganda. Its work is community-focused and partnerships can extend the reach of the network where there is a clear shared purpose." },
  { question: "How does EFEN approach safeguarding?", answer: "EFEN is committed to child protection, protection from sexual exploitation, abuse and harassment, non-discrimination, safe participation, confidential reporting, responsible conduct and data protection." },
  { question: "Are official contact details available?", answer: "The EFEN administrator can publish official email, telephone and safeguarding contacts from the private content studio when they are confirmed." },
];

export const defaultSocialLinks: SocialLink[] = [
  { platform: "Facebook", url: "https://www.facebook.com/eminentfen" },
  { platform: "LinkedIn", url: "" },
  { platform: "X", url: "https://x.com/eminentfen" },
  { platform: "Instagram", url: "" },
  { platform: "WhatsApp", url: "" },
  { platform: "TikTok", url: "https://www.tiktok.com/@eminentefen" },
];

export const defaultContactSettings: ContactSettings = { email: "", phone: "", whatsapp: "", address: "Soroti City, Eastern Uganda", safeguardingEmail: "", safeguardingPhone: "" };
export const defaultAboutContent: AboutContent = {
  intro: "Eminent Friends Empowerment Network is a non-profit, non-political, non-sectarian and community-focused organization based in Soroti City, Eastern Uganda.",
  purposeTitle: "Building bridges between people and opportunity.",
  purposeLead: "We believe stronger relationships can open practical pathways to livelihoods, leadership, participation and lasting change.",
  purposeBody: "EFEN brings together communities, young people, professionals, mentors, institutions, businesses, development partners and other stakeholders to create a more inclusive, resilient and prosperous future.",
  vision: "A world with stronger social connections and networks that empower people and communities to prosper.",
  mission: "To empower individuals and communities through friendship and stronger social connections, advancing inclusive development, sustainable livelihoods, ethical leadership, innovation and partnerships for lasting prosperity.",
  valuesTitle: "Values are the way the work feels.",
  beliefsTitle: "Connect. Empower. Act. Transform.",
  teamIntroImageUrl: "",
  teamIntroTitle: "A network in motion",
  teamIntroCaption: "Connect. Empower. Transform.",
};
