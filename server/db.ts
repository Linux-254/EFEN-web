import { asc, desc, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { InsertProject, InsertSubmission, InsertUser, projects, siteSettings, submissions, users } from "../drizzle/schema";
import { AboutContent, ContactSettings, defaultAboutContent, defaultContactSettings, defaultFaqs, defaultSocialLinks, FaqItem, SocialLink } from "../shared/siteContent";
import { previewProjects } from "./content";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;
let projectSeedPromise: Promise<void> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(postgres(process.env.DATABASE_URL, { max: 3, prepare: false }));
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  const values: InsertUser = { openId: user.openId };
  const updateSet: Record<string, unknown> = {};
  const textFields = ["name", "email", "loginMethod"] as const;
  for (const field of textFields) {
    if (user[field] !== undefined) {
      values[field] = user[field] ?? null;
      updateSet[field] = user[field] ?? null;
    }
  }
  if (user.lastSignedIn !== undefined) {
    values.lastSignedIn = user.lastSignedIn;
    updateSet.lastSignedIn = user.lastSignedIn;
  }
  if (user.role !== undefined) {
    values.role = user.role;
    updateSet.role = user.role;
  } else if (user.openId === ENV.ownerOpenId) {
    values.role = "admin";
    updateSet.role = "admin";
  }
  values.lastSignedIn ??= new Date();
  if (Object.keys(updateSet).length === 0) updateSet.lastSignedIn = new Date();
  await db.insert(users).values(values).onConflictDoUpdate({ target: users.openId, set: updateSet });
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function listProjects(status?: "draft" | "published") {
  const db = await getDb();
  if (!db) return [];
  await ensurePreviewProjects(db);
  const query = db.select().from(projects).orderBy(desc(projects.publishedAt));
  return status ? query.where(eq(projects.status, status)) : query;
}

async function ensurePreviewProjects(db: ReturnType<typeof drizzle>) {
  if (projectSeedPromise) return projectSeedPromise;
  projectSeedPromise = (async () => {
    const existing = await db.select({ id: projects.id }).from(projects).limit(1);
    if (existing.length) return;
    await db.insert(projects).values(previewProjects.map(({ id: _id, ...project }) => project));
  })().catch((error) => {
    projectSeedPromise = null;
    console.warn("[Database] Could not seed EFEN projects:", error);
  });
  return projectSeedPromise;
}

export async function createProject(input: InsertProject) {
  const db = await getDb();
  if (!db) throw new Error("Database is not configured");
  const result = await db.insert(projects).values(input).returning({ id: projects.id });
  const id = result[0].id;
  const rows = await db.select().from(projects).where(eq(projects.id, id)).limit(1);
  return rows[0];
}

export async function updateProject(id: number, input: Partial<InsertProject>) {
  const db = await getDb();
  if (!db) throw new Error("Database is not configured");
  await db.update(projects).set(input).where(eq(projects.id, id));
  const rows = await db.select().from(projects).where(eq(projects.id, id)).limit(1);
  return rows[0];
}

export async function deleteProject(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database is not configured");
  await db.delete(projects).where(eq(projects.id, id));
  return { success: true as const };
}

export type EditableSiteSettings = { faqs: FaqItem[]; socialLinks: SocialLink[]; contact: ContactSettings; about: AboutContent };

function normalizeProfessionalEmails(value: Partial<ContactSettings>["professionalEmails"]): ContactSettings["professionalEmails"] {
  const defaults = defaultContactSettings.professionalEmails;
  const stored = Array.isArray(value) ? value : [];
  return defaults.map((fallback) => {
    const match = stored.find((item) => item?.role === fallback.role);
    return { role: fallback.role, email: typeof match?.email === "string" ? match.email : fallback.email };
  });
}

function parseJson<T>(value: string, fallback: T): T {
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

export async function getSiteSettings(): Promise<EditableSiteSettings> {
  const db = await getDb();
  if (!db) return { faqs: defaultFaqs, socialLinks: defaultSocialLinks, contact: defaultContactSettings, about: defaultAboutContent };
  const row = (await db.select().from(siteSettings).limit(1))[0];
  if (!row) return { faqs: defaultFaqs, socialLinks: defaultSocialLinks, contact: defaultContactSettings, about: defaultAboutContent };
  const storedContact = parseJson<Partial<ContactSettings>>(row.contact, {});
  return {
    faqs: parseJson(row.faqs, defaultFaqs),
    socialLinks: [...parseJson<SocialLink[]>(row.socialLinks, defaultSocialLinks), ...defaultSocialLinks.filter((defaultLink) => !parseJson<SocialLink[]>(row.socialLinks, defaultSocialLinks).some((link) => link.platform.toLowerCase() === defaultLink.platform.toLowerCase()))],
    contact: { ...defaultContactSettings, ...storedContact, professionalEmails: normalizeProfessionalEmails(storedContact.professionalEmails) },
    about: { ...defaultAboutContent, ...parseJson<Partial<AboutContent>>(row.about, {}) },
  };
}

export async function saveSiteSettings(input: EditableSiteSettings) {
  const db = await getDb();
  if (!db) throw new Error("Database is not configured");
  const values = { faqs: JSON.stringify(input.faqs), socialLinks: JSON.stringify(input.socialLinks), contact: JSON.stringify(input.contact), about: JSON.stringify(input.about) };
  const existing = (await db.select({ id: siteSettings.id }).from(siteSettings).limit(1))[0];
  if (existing) await db.update(siteSettings).set(values).where(eq(siteSettings.id, existing.id));
  else await db.insert(siteSettings).values(values);
  return input;
}

export async function createSubmission(input: InsertSubmission) {
  const db = await getDb();
  if (!db) throw new Error("Database is not configured");
  const result = await db.insert(submissions).values(input).returning({ id: submissions.id });
  const id = result[0].id;
  return (await db.select().from(submissions).where(eq(submissions.id, id)).limit(1))[0];
}

export async function listSubmissions() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(submissions).orderBy(desc(submissions.createdAt));
}

export async function updateSubmissionStatus(id: number, status: "new" | "read" | "archived") {
  const db = await getDb();
  if (!db) throw new Error("Database is not configured");
  await db.update(submissions).set({ status }).where(eq(submissions.id, id));
  return (await db.select().from(submissions).where(eq(submissions.id, id)).limit(1))[0];
}
