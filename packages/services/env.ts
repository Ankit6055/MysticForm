import { z } from "zod";

const envSchema = z.object({
  GOOGLE_OAUTH_CLIENT_ID: z.string().optional(),
  GOOGLE_OAUTH_CLIENT_SECRET: z.string().optional(),
  GOOGLE_OAUTH_REDIRECT_URI: z.string().optional(),
  JWT_SECRET: z.string().min(32),
  SESSION_COOKIE_NAME: z.string().default("mf_session"),
  SESSION_TTL_DAYS: z.coerce.number().int().positive().default(30),
});

function createEnv(env: NodeJS.ProcessEnv) {
  const safeParseResult = envSchema.safeParse(env);
  if (!safeParseResult.success) throw new Error(safeParseResult.error.message);
  return safeParseResult.data;
}

export const env = createEnv(process.env);
