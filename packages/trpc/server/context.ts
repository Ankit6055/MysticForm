import { SelectUser } from "@repo/database/schema";
import { env } from "@repo/services/env";
import { verifySessionToken } from "@repo/services/user/jwt";
import { userService } from "./services";

type CookieOptions = {
  httpOnly: boolean;
  path: string;
  sameSite: "lax" | "none";
  secure: boolean;
  maxAge?: number;
};

type RequestLike = {
  cookies?: Record<string, string | undefined>;
  ip?: string;
  headers?: Record<string, string | string[] | undefined>;
};

type ResponseLike = {
  cookie: (name: string, value: string, options: CookieOptions) => void;
  clearCookie: (name: string, options: Omit<CookieOptions, "maxAge">) => void;
};

function getCookieOptions(): CookieOptions {
  const nodeEnv = process.env.NODE_ENV as string | undefined;
  const isProd = nodeEnv === "prod" || nodeEnv === "production";

  return {
    httpOnly: true,
    path: "/",
    sameSite: isProd ? "none" : "lax",
    secure: isProd,
    maxAge: env.SESSION_TTL_DAYS * 24 * 60 * 60 * 1000,
  };
}

export async function createContext(opts?: { req?: RequestLike; res?: ResponseLike }) {
  const token = opts?.req?.cookies?.[env.SESSION_COOKIE_NAME];
  let user: SelectUser | null = null;

  if (token) {
    const claims = verifySessionToken(token);
    if (claims) {
      user = await userService.findById(claims.sub);
    }
  }

  return {
    user,
    ip: opts?.req?.ip ?? "unknown",
    userAgent:
      typeof opts?.req?.headers?.["user-agent"] === "string"
        ? opts.req.headers["user-agent"]
        : null,
    setSessionCookie(tokenToSet: string) {
      opts?.res?.cookie(env.SESSION_COOKIE_NAME, tokenToSet, getCookieOptions());
    },
    clearSessionCookie() {
      const { maxAge, ...options } = getCookieOptions();
      opts?.res?.clearCookie(env.SESSION_COOKIE_NAME, options);
    },
  };
}

export type Context = Awaited<ReturnType<typeof createContext>>;
