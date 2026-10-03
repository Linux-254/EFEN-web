import "dotenv/config";
import express from "express";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { appRouter } from "../server/routers";
import { createContext } from "../server/_core/context";

const app = express();
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

const trpcHandler = createExpressMiddleware({ router: appRouter, createContext });
app.use("/api/trpc", trpcHandler);
app.use("/trpc", trpcHandler);

export default function handler(req: express.Request, res: express.Response) {
  return app(req, res);
}
