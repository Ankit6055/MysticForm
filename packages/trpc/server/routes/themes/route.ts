import { TRPCError } from "@trpc/server";
import { ThemeServiceError } from "@repo/services/theme";
import { z, zodUndefinedModel } from "../../schema";
import { themeService } from "../../services";
import { publicProcedure, router } from "../../trpc";
import { generatePath } from "../../utils/path-generator";

const TAGS = ["Themes"];
const getPath = generatePath("/themes");

const themeTokensSchema = z.object({
  background: z.string(),
  foreground: z.string(),
  accent: z.string(),
  accentForeground: z.string(),
  muted: z.string(),
  font: z.string(),
  radius: z.string(),
});

const themeOutputSchema = z.object({
  id: z.uuid(),
  name: z.string(),
  slug: z.string(),
  description: z.string().nullable(),
  tokens: themeTokensSchema,
  previewImageUrl: z.string().nullable(),
  isBuiltIn: z.boolean().nullable(),
  createdAt: z.date().nullable(),
});

function mapThemeServiceError(error: unknown): never {
  if (error instanceof ThemeServiceError) {
    throw new TRPCError({ code: error.code, message: error.message });
  }

  throw error;
}

export const themesRouter = router({
  list: publicProcedure
    .meta({ openapi: { method: "GET", path: getPath(""), tags: TAGS } })
    .input(zodUndefinedModel)
    .output(z.array(themeOutputSchema))
    .query(() => themeService.list()),
  get: publicProcedure
    .meta({ openapi: { method: "GET", path: getPath("/{slug}"), tags: TAGS } })
    .input(z.object({ slug: z.string().min(1).max(60) }))
    .output(themeOutputSchema)
    .query(async ({ input }) => {
      try {
        return await themeService.get(input.slug);
      } catch (error) {
        mapThemeServiceError(error);
      }
    }),
});

export { themeTokensSchema };
