import express from "express";
import { logger } from "@repo/logger";
import cors from "cors";
import cookieParser from "cookie-parser";

import * as trpcExpress from "@trpc/server/adapters/express";
import { generateOpenApiDocument, createOpenApiExpressMiddleware } from "trpc-to-openapi";
import { apiReference } from "@scalar/express-api-reference";

import { serverRouter, createContext } from "@repo/trpc/server";
import UserService from "@repo/services/user";
import { signSessionToken } from "@repo/services/user/jwt";
import { env as serviceEnv } from "@repo/services/env";

import { env } from "./env";

export const app = express();
app.set("trust proxy", 1);

const userService = new UserService();
const openApiDocument = generateOpenApiDocument(serverRouter, {
  title: "MysticForm OpenAPI",
  version: "1.0.0",
  baseUrl: env.BASE_URL.concat("/api"),
});

if (env.NODE_ENV !== "prod") {
  app.use(
    cors({
      origin: env.WEB_URL,
      credentials: true,
    }),
  );
} else {
  app.use(
    cors({
      origin: env.WEB_URL,
      credentials: true,
    }),
  );
}

app.use(express.json());
app.use(cookieParser());

app.get("/", (req, res) => {
  return res.json({ message: "MysticForm is up and running..." });
});

app.get("/health", (req, res) => {
  return res.json({ message: "MysticForm server is healthy", healthy: true });
});

app.get("/auth/google/callback", async (req, res) => {
  try {
    const code = typeof req.query.code === "string" ? req.query.code : null;
    if (!code) {
      return res.redirect(`${env.WEB_URL}/login?error=missing_google_code`);
    }

    const user = await userService.signInWithGoogleCode(code);
    const isProd = env.NODE_ENV === "prod";
    res.cookie(serviceEnv.SESSION_COOKIE_NAME, signSessionToken(user), {
      httpOnly: true,
      path: "/",
      sameSite: isProd ? "none" : "lax",
      secure: isProd,
      maxAge: serviceEnv.SESSION_TTL_DAYS * 24 * 60 * 60 * 1000,
    });

    const state = typeof req.query.state === "string" ? req.query.state : "";
    const next = state.startsWith("/") ? state : "/dashboard";
    return res.redirect(`${env.WEB_URL}${next}`);
  } catch (err) {
    logger.error("Google OAuth callback failed", {
      err: err instanceof Error ? err.message : "unknown error",
    });
    return res.redirect(`${env.WEB_URL}/login?error=google_oauth_failed`);
  }
});

logger.debug(`openapi.json: ${env.BASE_URL}/openapi.json`);
app.get("/openapi.json", (req, res) => {
  return res.json(openApiDocument);
});

logger.debug(`docs: ${env.BASE_URL}/docs`);
app.use("/docs", apiReference({ url: "/openapi.json" }));

app.use(
  "/api",
  createOpenApiExpressMiddleware({
    router: serverRouter,
    createContext,
  }),
);

app.use(
  "/trpc",
  trpcExpress.createExpressMiddleware({
    router: serverRouter,
    createContext,
  }),
);

export default app;
