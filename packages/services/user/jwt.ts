import jwt from "jsonwebtoken";
import { SelectUser } from "@repo/database/schema";
import { env } from "../env";

export interface SessionClaims {
  sub: string;
  email: string;
}

export function signSessionToken(user: Pick<SelectUser, "id" | "email">) {
  return jwt.sign(
    {
      sub: user.id,
      email: user.email,
    },
    env.JWT_SECRET,
    {
      algorithm: "HS256",
      expiresIn: `${env.SESSION_TTL_DAYS}d`,
    },
  );
}

export function verifySessionToken(token: string): SessionClaims | null {
  try {
    const payload = jwt.verify(token, env.JWT_SECRET, {
      algorithms: ["HS256"],
    });

    if (!payload || typeof payload === "string") return null;
    if (typeof payload.sub !== "string" || typeof payload.email !== "string") return null;

    return {
      sub: payload.sub,
      email: payload.email,
    };
  } catch {
    return null;
  }
}
