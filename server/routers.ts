import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { COOKIE_NAME } from "@shared/const";
import { previewProjects } from "./content";
import { clearAdminSession, establishAdminSession, hasConfiguredAdminPin, isAdminSession } from "./adminAccess";
import { createProject, createSubmission, deleteProject, getSiteSettings, listProjects, listSubmissions, saveSiteSettings, updateProject, updateSubmissionStatus } from "./db";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { ENV } from "./_core/env";

const projectInput = z.object({
  slug: z.string().min(2).max(160),
  title: z.string().min(2).max(180),
  summary: z.string().min(10).max(600),
  detail: z.string().min(10).max(3000),
  category: z.string().min(2).max(100),
  status: z.enum(["draft", "published"]).default("published"),
  imageUrl: z.string().url().or(z.literal("")).nullable().optional(),
  imageUrls: z.array(z.string().url()).max(5).default([]),
  imageMeta: z.array(z.object({ url: z.string().url(), caption: z.string().max(240), alt: z.string().max(240) })).max(5).default([]),
});

const projectUpdate = projectInput.partial().extend({ id: z.number().int().positive() });

const submissionInput = z.object({
  type: z.enum(["contact", "opportunity"]),
  pathway: z.enum(["member", "volunteer", "partner", "opportunity"]),
  name: z.string().min(2).max(180),
  email: z.string().email().max(320),
  phone: z.string().max(80).optional().or(z.literal("")),
  organization: z.string().max(180).optional().or(z.literal("")),
  message: z.string().min(10).max(5000),
  website: z.string().max(200).optional().or(z.literal("")),
});

const settingsInput = z.object({
  faqs: z.array(z.object({ question: z.string().min(2).max(240), answer: z.string().min(2).max(3000) })).max(30),
  socialLinks: z.array(z.object({ platform: z.string().min(2).max(40), url: z.string().url().or(z.literal("")) })).max(12),
  contact: z.object({ email: z.string().email().or(z.literal("")), phone: z.string().max(80), whatsapp: z.string().max(80), address: z.string().max(240), safeguardingEmail: z.string().email().or(z.literal("")), safeguardingPhone: z.string().max(80) }),
  about: z.object({ intro: z.string().min(10).max(1000), purposeTitle: z.string().min(2).max(240), purposeLead: z.string().min(10).max(1000), purposeBody: z.string().min(10).max(1500), vision: z.string().min(10).max(1000), mission: z.string().min(10).max(1500), valuesTitle: z.string().min(2).max(240), beliefsTitle: z.string().min(2).max(240), teamIntroImageUrl: z.string().url().or(z.literal("")), teamIntroTitle: z.string().max(160), teamIntroCaption: z.string().max(160), coreValues: z.array(z.string().min(1).max(80)).max(20), focusAreas: z.array(z.string().min(1).max(180)).max(20) }),
});

const pinAdminProcedure = publicProcedure.use(({ ctx, next }) => {
  if (ENV.adminPin && !isAdminSession(ctx.req)) {
    throw new TRPCError({ code: "FORBIDDEN", message: "Admin session required" });
  }
  return next();
});

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),
  projects: router({
    list: publicProcedure.input(z.object({ page: z.number().int().min(1).default(1), pageSize: z.number().int().min(1).max(12).default(3) }).optional()).query(async ({ input }) => {
      const page = input?.page ?? 1;
      const pageSize = input?.pageSize ?? 3;
      const dbRows = await listProjects("published");
      const source = dbRows.length ? dbRows : previewProjects;
      const start = (page - 1) * pageSize;
      const items = source.slice(start, start + pageSize);
      return { items, page, pageSize, hasNext: start + pageSize < source.length, total: source.length };
    }),
    bySlug: publicProcedure.input(z.object({ slug: z.string() })).query(async ({ input }) => {
      const rows = await listProjects("published");
      return rows.find((project) => project.slug === input.slug) ?? previewProjects.find((project) => project.slug === input.slug) ?? null;
    }),
  }),
  site: router({
    settings: publicProcedure.query(async () => getSiteSettings()),
    submit: publicProcedure.input(submissionInput).mutation(async ({ input }) => {
      if (input.website) return { success: true as const };
      const { website: _website, ...submission } = input;
      await createSubmission({ ...submission, phone: submission.phone || null, organization: submission.organization || null, status: "new" });
      return { success: true as const };
    }),
  }),
  admin: router({
    status: publicProcedure.query(({ ctx }) => ({ authenticated: !ENV.adminPin || isAdminSession(ctx.req), pinConfigured: hasConfiguredAdminPin(), previewMode: !ENV.adminPin })),
    login: publicProcedure.input(z.object({ pin: z.string().min(1).max(64) })).mutation(({ ctx, input }) => {
      return establishAdminSession(ctx.req, ctx.res, input.pin);
    }),
    logout: publicProcedure.mutation(({ ctx }) => {
      clearAdminSession(ctx.res);
      return { success: true as const };
    }),
    projects: pinAdminProcedure.query(async () => {
      const rows = await listProjects();
      return rows.length ? rows : previewProjects;
    }),
    createProject: pinAdminProcedure.input(projectInput).mutation(async ({ input }) => {
      const { imageUrls, imageMeta, ...rest } = input;
      return createProject({ ...rest, imageUrl: rest.imageUrl || imageUrls[0] || null, imageUrls: JSON.stringify(imageUrls), imageMeta: JSON.stringify(imageMeta) });
    }),
    updateProject: pinAdminProcedure.input(projectUpdate).mutation(async ({ input }) => {
      const { id, ...changes } = input;
      const { imageUrls, imageMeta, ...rest } = changes;
      return updateProject(id, { ...rest, imageUrl: rest.imageUrl || imageUrls?.[0] || null, imageUrls: imageUrls ? JSON.stringify(imageUrls) : undefined, imageMeta: imageMeta ? JSON.stringify(imageMeta) : undefined });
    }),
    deleteProject: pinAdminProcedure.input(z.object({ id: z.number().int().positive() })).mutation(async ({ input }) => deleteProject(input.id)),
    settings: pinAdminProcedure.query(async () => getSiteSettings()),
    updateSettings: pinAdminProcedure.input(settingsInput).mutation(async ({ input }) => saveSiteSettings(input)),
    submissions: pinAdminProcedure.query(async () => listSubmissions()),
    updateSubmissionStatus: pinAdminProcedure.input(z.object({ id: z.number().int().positive(), status: z.enum(["new", "read", "archived"]) })).mutation(async ({ input }) => updateSubmissionStatus(input.id, input.status)),
  }),
});

export type AppRouter = typeof appRouter;
