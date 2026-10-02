import "dotenv/config";
import express from "express";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "../server/_core/oauth";
import { registerStorageProxy } from "../server/_core/storageProxy";
import { createContext } from "../server/_core/context";
import { appRouter } from "../server/routers";

const app = express();
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
registerStorageProxy(app);
registerOAuthRoutes(app);
const trpcHandler = createExpressMiddleware({ router: appRouter, createContext });
// Vercel may invoke this function with either the original /api/trpc path or
// the /trpc path after the /api/(.*) rewrite. Support both forms explicitly.
app.use("/api/trpc", trpcHandler);
app.use("/trpc", trpcHandler);

export default function handler(req: express.Request, res: express.Response) {
  return app(req, res);
}
