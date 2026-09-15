import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { COOKIE_NAME } from "@shared/const";
import { previewProjects } from "./content";
import { clearAdminSession, establishAdminSession, hasConfiguredAdminPin, isAdminSession } from "./adminAccess";
import { createProject, deleteProject, getDb, listProjects, updateProject } from "./db";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";

const projectInput = z.object({
  slug: z.string().min(2).max(160),
  title: z.string().min(2).max(180),
  summary: z.string().min(10).max(600),
  detail: z.string().min(10).max(3000),
  category: z.string().min(2).max(100),
  status: z.enum(["draft", "published"]).default("published"),
  imageUrl: z.string().url().or(z.literal("")).nullable().optional(),
});

const projectUpdate = projectInput.partial().extend({ id: z.number().int().positive() });

const pinAdminProcedure = publicProcedure.use(({ ctx, next }) => {
  if (!isAdminSession(ctx.req)) {
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
  admin: router({
    status: publicProcedure.query(({ ctx }) => ({ authenticated: isAdminSession(ctx.req), pinConfigured: hasConfiguredAdminPin(), previewMode: process.env.NODE_ENV !== "production" && !process.env.EFEN_ADMIN_PIN })),
    login: publicProcedure.input(z.object({ pin: z.string().min(1).max(64) })).mutation(({ ctx, input }) => {
      const success = establishAdminSession(ctx.req, ctx.res, input.pin);
      return { success };
    }),
    logout: publicProcedure.mutation(({ ctx }) => {
      clearAdminSession(ctx.res);
      return { success: true as const };
    }),
    projects: pinAdminProcedure.query(async () => {
      const rows = await listProjects();
      return rows.length ? rows : previewProjects;
    }),
    createProject: pinAdminProcedure.input(projectInput).mutation(async ({ input }) => createProject({ ...input, imageUrl: input.imageUrl || null })),
    updateProject: pinAdminProcedure.input(projectUpdate).mutation(async ({ input }) => {
      const { id, ...changes } = input;
      return updateProject(id, { ...changes, imageUrl: changes.imageUrl || null });
    }),
    deleteProject: pinAdminProcedure.input(z.object({ id: z.number().int().positive() })).mutation(async ({ input }) => deleteProject(input.id)),
  }),
});

export type AppRouter = typeof appRouter;
