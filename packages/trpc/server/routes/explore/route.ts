import { z } from "../../schema";
import { exploreService } from "../../services";
import { publicProcedure, router } from "../../trpc";
import { generatePath } from "../../utils/path-generator";
import { themeTokensSchema } from "../themes/route";

const TAGS = ["Explore"];
const getPath = generatePath("/explore");

const exploreLimitSchema = z.number().int().positive().max(50).default(12);

const exploreCardSchema = z.object({
  id: z.uuid(),
  slug: z.string(),
  title: z.string(),
  description: z.string().nullable(),
  coverEmoji: z.string().nullable(),
  theme: z
    .object({
      slug: z.string(),
      tokens: themeTokensSchema,
    })
    .nullable(),
  responseCount: z.number().int().nonnegative(),
  creatorName: z.string(),
});

const paginatedExploreSchema = z.object({
  items: z.array(exploreCardSchema),
  nextCursor: z.string().nullable(),
});

export const exploreRouter = router({
  featured: publicProcedure
    .meta({ openapi: { method: "GET", path: getPath("/featured"), tags: TAGS } })
    .input(z.object({ limit: exploreLimitSchema }).optional())
    .output(z.array(exploreCardSchema))
    .query(async ({ input }) => {
      const result = await exploreService.featured({ limit: input?.limit ?? 12 });
      return result.items;
    }),
  templates: publicProcedure
    .meta({ openapi: { method: "GET", path: getPath("/templates"), tags: TAGS } })
    .input(z.object({ limit: exploreLimitSchema }).optional())
    .output(z.array(exploreCardSchema))
    .query(async ({ input }) => {
      const result = await exploreService.templates({ limit: input?.limit ?? 50 });
      return result.items;
    }),
  byTheme: publicProcedure
    .meta({ openapi: { method: "GET", path: getPath("/theme/{themeSlug}"), tags: TAGS } })
    .input(
      z.object({
        themeSlug: z.string().min(1).max(60),
        limit: exploreLimitSchema,
        cursor: z.string().optional(),
      }),
    )
    .output(paginatedExploreSchema)
    .query(({ input }) => exploreService.byTheme(input)),
  search: publicProcedure
    .meta({ openapi: { method: "GET", path: getPath("/search"), tags: TAGS } })
    .input(
      z.object({
        q: z.string().trim().min(1).max(120),
        limit: exploreLimitSchema,
        cursor: z.string().optional(),
      }),
    )
    .output(paginatedExploreSchema)
    .query(({ input }) => exploreService.search(input)),
});
