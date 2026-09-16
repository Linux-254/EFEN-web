import { asc, desc, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertProject, InsertSubmission, InsertUser, projects, siteSettings, submissions, users } from "../drizzle/schema";
import { AboutContent, ContactSettings, defaultAboutContent, defaultContactSettings, defaultFaqs, defaultSocialLinks, FaqItem, SocialLink } from "../shared/siteContent";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
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
  await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
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
  const query = db.select().from(projects).orderBy(desc(projects.publishedAt));
  return status ? query.where(eq(projects.status, status)) : query;
}

export async function createProject(input: InsertProject) {
  const db = await getDb();
  if (!db) throw new Error("Database is not configured");
  const result = await db.insert(projects).values(input);
  const id = Number(result[0].insertId);
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
    socialLinks: parseJson(row.socialLinks, defaultSocialLinks),
    contact: { ...defaultContactSettings, ...storedContact },
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
  const result = await db.insert(submissions).values(input);
  const id = Number(result[0].insertId);
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
