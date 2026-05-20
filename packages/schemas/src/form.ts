import { z } from "zod";

export const formMetadataSchema = z.object({
  title: z.string().min(1).max(120),
  description: z.string().max(2000).optional(),
  slug: z.string().min(3).max(80).regex(/^[a-z0-9-]+$/),
  visibility: z.enum(["draft", "unlisted", "public"]),
  coverEmoji: z.string().max(8).optional(),
  submitLabel: z.string().max(40).optional(),
  thankYouMessage: z.string().max(1000).optional(),
  notifyRespondent: z.boolean().optional(),
  responseLimit: z.number().int().positive().nullable().optional(),
  expiresAt: z.iso.datetime().nullable().optional(),
  themeId: z.uuid().nullable().optional(),
});

export type FormMetadata = z.infer<typeof formMetadataSchema>;
