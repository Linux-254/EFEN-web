import "dotenv/config";
import express from "express";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import type { Request, Response } from "express";

type AppHandler = (req: Request, res: Response) => unknown;
let appHandlerPromise: Promise<AppHandler> | null = null;

async function createAppHandler(): Promise<AppHandler> {
  const [{ createContext }, { appRouter }] = await Promise.all([
    import("../server/_core/context"),
    import("../server/routers"),
  ]);

  const app = express();
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));
  const trpcHandler = createExpressMiddleware({ router: appRouter, createContext });
  app.use("/api/trpc", trpcHandler);
  app.use("/trpc", trpcHandler);

  return (req, res) => app(req, res);
}

async function handler(req: Request, res: Response) {
  try {
    appHandlerPromise ??= createAppHandler();
    return (await appHandlerPromise)(req, res);
  } catch (error) {
    appHandlerPromise = null;
    console.error("[EFEN API] Initialization failed", error);
    return res.status(503).json({ error: "EFEN API temporarily unavailable" });
  }
}

export default handler;
