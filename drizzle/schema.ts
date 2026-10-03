import { pgEnum, pgTable, serial, text, timestamp, varchar } from "drizzle-orm/pg-core";

export const userRole = pgEnum("user_role", ["user", "admin"]);
export const projectStatus = pgEnum("project_status", ["draft", "published"]);
export const submissionType = pgEnum("submission_type", ["contact", "opportunity"]);
export const submissionStatus = pgEnum("submission_status", ["new", "read", "archived"]);

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: userRole("role").default("user").notNull(),
  createdAt: timestamp("createdAt", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updatedAt", { withTimezone: true }).defaultNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn", { withTimezone: true }).defaultNow().notNull(),
});

export const projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  slug: varchar("slug", { length: 160 }).notNull().unique(),
  title: varchar("title", { length: 180 }).notNull(),
  summary: text("summary").notNull(),
  detail: text("detail").notNull(),
  category: varchar("category", { length: 100 }).notNull(),
  status: projectStatus("status").default("published").notNull(),
  imageUrl: varchar("imageUrl", { length: 500 }),
  imageUrls: text("imageUrls"),
  imageMeta: text("imageMeta"),
  publishedAt: timestamp("publishedAt", { withTimezone: true }).defaultNow().notNull(),
  createdAt: timestamp("createdAt", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updatedAt", { withTimezone: true }).defaultNow().notNull(),
});

export const siteSettings = pgTable("siteSettings", {
  id: serial("id").primaryKey(),
  faqs: text("faqs").notNull(),
  socialLinks: text("socialLinks").notNull(),
  contact: text("contact").notNull(),
  about: text("about").notNull().default("{}"),
  updatedAt: timestamp("updatedAt", { withTimezone: true }).defaultNow().notNull(),
});

export const submissions = pgTable("submissions", {
  id: serial("id").primaryKey(),
  type: submissionType("type").notNull(),
  pathway: varchar("pathway", { length: 40 }).notNull().default("opportunity"),
  name: varchar("name", { length: 180 }).notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  phone: varchar("phone", { length: 80 }),
  organization: varchar("organization", { length: 180 }),
  message: text("message").notNull(),
  status: submissionStatus("status").default("new").notNull(),
  createdAt: timestamp("createdAt", { withTimezone: true }).defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type Project = typeof projects.$inferSelect;
export type InsertProject = typeof projects.$inferInsert;
export type SiteSettings = typeof siteSettings.$inferSelect;
export type InsertSiteSettings = typeof siteSettings.$inferInsert;
export type Submission = typeof submissions.$inferSelect;
export type InsertSubmission = typeof submissions.$inferInsert;
