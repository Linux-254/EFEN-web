import "dotenv/config";
import express from "express";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { appRouter } from "../server/routers.ts";
import { createContext } from "../server/_core/context.ts";

const app = express();
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

const trpcHandler = createExpressMiddleware({ router: appRouter, createContext });
app.use("/api/trpc", trpcHandler);
app.use("/trpc", trpcHandler);

// Fallback in case Vercel rewrites directly to root or strips prefix
app.use((req, res, next) => {
  if (req.url.startsWith("/api/trpc") || req.url.startsWith("/trpc")) {
    return next();
  }
  return trpcHandler(req, res, next);
});

// Catch-all error middleware prevents unhandled rejections from crashing the serverless worker
app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error("[EFEN API Error]", err);
  if (!res.headersSent) {
    res.status(500).json({ error: "Internal API error" });
  }
});

export default function handler(req: express.Request, res: express.Response) {
  return app(req, res);
}
