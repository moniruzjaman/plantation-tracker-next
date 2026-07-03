import "dotenv/config";
import { Hono } from "hono";
import { handle } from "hono/vercel";
import { bodyLimit } from "hono/body-limit";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter } from "../api/router";
import { createContext } from "../api/context";
import { createOAuthCallbackHandler } from "../api/kimi/auth";
import { Paths } from "../contracts/constants";

const app = new Hono().use(bodyLimit({ maxSize: 50 * 1024 * 1024 }));

app.get(Paths.oauthCallback, createOAuthCallbackHandler());

app.use("/api/trpc/*", async (c) => {
  return fetchRequestHandler({
    endpoint: "/api/trpc",
    req: c.req.raw,
    router: appRouter,
    createContext,
  });
});

app.all("/api/*", (c) => c.json({ error: "Not Found" }, 404));

export const config = {
  runtime: "nodejs20.x",
};

export default handle(app);