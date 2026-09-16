import type { Project } from "../drizzle/schema";

const date = new Date("2026-01-01T00:00:00.000Z");

export const previewProjects: Project[] = [
  {
    id: 1,
    slug: "connect4change",
    title: "Connect4Change",
    summary: "Building stronger youth connections for opportunity, leadership and prosperity.",
    detail: "EFEN's youth-focused innovation model helps young people turn social connections into practical pathways to mentorship, livelihoods, leadership and community action.",
    category: "Youth empowerment",
    status: "published",
    imageUrl: null,
    imageUrls: null,
    publishedAt: date,
    createdAt: date,
    updatedAt: date,
  },
  {
    id: 2,
    slug: "inclusive-community-development",
    title: "Inclusive community development",
    summary: "Creating space for dignity, participation and access to opportunity.",
    detail: "We work alongside communities, persons with disabilities and marginalized groups to strengthen participation and local solutions.",
    category: "Inclusion",
    status: "published",
    imageUrl: null,
    imageUrls: null,
    publishedAt: date,
    createdAt: date,
    updatedAt: date,
  },
  {
    id: 3,
    slug: "sustainable-livelihoods",
    title: "Sustainable livelihoods",
    summary: "Connecting practical skills, enterprise and opportunity to help people prosper.",
    detail: "EFEN brings together skills development, entrepreneurship, market linkages and financial capability to support locally relevant livelihoods.",
    category: "Livelihoods",
    status: "published",
    imageUrl: null,
    imageUrls: null,
    publishedAt: date,
    createdAt: date,
    updatedAt: date,
  },
];
