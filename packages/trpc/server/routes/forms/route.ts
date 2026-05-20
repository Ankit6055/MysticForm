import { TRPCError } from "@trpc/server";
import { formFieldSchema, formMetadataSchema } from "@repo/schemas";
import { z } from "../../schema";
import { formService } from "../../services";
import { protectedProcedure, publicProcedure, router } from "../../trpc";
import { generatePath } from "../../utils/path-generator";
import { FormServiceError } from "@repo/services/form";
import { consume, hashIp } from "@repo/services/rate-limit";

const TAGS = ["Forms"];
const getPath = generatePath("/forms");

const idInputSchema = z.object({ id: z.uuid() });
const formVisibilitySchema = z.enum(["draft", "unlisted", "public"]);
const formStatusSchema = z.enum(["active", "archived"]);
const fieldTypeSchema = z.enum([
  "short_text",
  "long_text",
  "email",
  "number",
  "single_select",
  "multi_select",
  "checkbox",
  "dropdown",
  "rating",
  "date",
]);

const formOutputSchema = z.object({
  id: z.uuid(),
  ownerId: z.uuid(),
  themeId: z.uuid().nullable(),
  title: z.string(),
  description: z.string().nullable(),
  slug: z.string(),
  visibility: formVisibilitySchema,
  status: formStatusSchema,
  coverEmoji: z.string().nullable(),
  submitLabel: z.string().nullable(),
  thankYouMessage: z.string().nullable(),
  notifyRespondent: z.boolean().nullable(),
  isTemplate: z.boolean().nullable(),
  passwordHash: z.string().nullable(),
  responseLimit: z.number().nullable(),
  expiresAt: z.date().nullable(),
  publishedAt: z.date().nullable(),
  createdAt: z.date().nullable(),
  updatedAt: z.date().nullable(),
});

const publicFormOutputSchema = formOutputSchema.omit({
  ownerId: true,
  passwordHash: true,
});

const fieldOutputSchema = z.object({
  id: z.uuid(),
  formId: z.uuid(),
  order: z.number().int().nonnegative(),
  type: fieldTypeSchema,
  label: z.string(),
  helpText: z.string().nullable(),
  required: z.boolean().nullable(),
  config: z.record(z.string(), z.unknown()),
  createdAt: z.date().nullable(),
  updatedAt: z.date().nullable(),
});

const listInputSchema = z
  .object({
    status: formStatusSchema.optional(),
    search: z.string().trim().min(1).max(120).optional(),
  })
  .optional();

const createInputSchema = z.object({
  title: z.string().min(1).max(120),
  slug: z
    .string()
    .min(3)
    .max(80)
    .regex(/^[a-z0-9-]+$/)
    .optional(),
});

const updateInputSchema = idInputSchema.extend(formMetadataSchema.shape);

const updateFieldsInputSchema = z.object({
  id: z.uuid(),
  fields: z.array(formFieldSchema),
});

const publishInputSchema = z.object({
  id: z.uuid(),
  visibility: z.enum(["unlisted", "public"]),
});

const setPasswordInputSchema = z.object({
  id: z.uuid(),
  password: z.string().min(8).max(200).nullable(),
});

const publicInputSchema = z.object({
  slug: z.string().min(3).max(80),
  password: z.string().max(200).optional(),
});

function mapFormServiceError(error: unknown): never {
  if (error instanceof FormServiceError) {
    throw new TRPCError({
      code: error.code,
      message: error.message,
    });
  }

  throw error;
}

export const formsRouter = router({
  list: protectedProcedure
    .meta({ openapi: { method: "GET", path: getPath("/list"), tags: TAGS } })
    .input(listInputSchema)
    .output(z.array(z.object({ form: formOutputSchema, responseCount: z.number() })))
    .query(({ input, ctx }) => {
      return formService.list({
        ownerId: ctx.user.id,
        status: input?.status,
        search: input?.search,
      });
    }),
  get: protectedProcedure
    .meta({ openapi: { method: "GET", path: getPath("/{id}"), tags: TAGS } })
    .input(idInputSchema)
    .output(z.object({ form: formOutputSchema, fields: z.array(fieldOutputSchema) }))
    .query(async ({ input, ctx }) => {
      try {
        return await formService.get(ctx.user.id, input.id);
      } catch (error) {
        mapFormServiceError(error);
      }
    }),
  create: protectedProcedure
    .meta({ openapi: { method: "POST", path: getPath(""), tags: TAGS } })
    .input(createInputSchema)
    .output(formOutputSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        return await formService.create({
          ownerId: ctx.user.id,
          title: input.title,
          slug: input.slug,
        });
      } catch (error) {
        mapFormServiceError(error);
      }
    }),
  update: protectedProcedure
    .meta({ openapi: { method: "PATCH", path: getPath("/{id}"), tags: TAGS } })
    .input(updateInputSchema)
    .output(formOutputSchema)
    .mutation(async ({ input, ctx }) => {
      const { id, ...metadata } = input;
      try {
        return await formService.update(ctx.user.id, id, metadata);
      } catch (error) {
        mapFormServiceError(error);
      }
    }),
  updateFields: protectedProcedure
    .meta({ openapi: { method: "PUT", path: getPath("/{id}/fields"), tags: TAGS } })
    .input(updateFieldsInputSchema)
    .output(z.array(fieldOutputSchema))
    .mutation(async ({ input, ctx }) => {
      try {
        return await formService.updateFields(ctx.user.id, input.id, input.fields);
      } catch (error) {
        mapFormServiceError(error);
      }
    }),
  publish: protectedProcedure
    .meta({ openapi: { method: "POST", path: getPath("/{id}/publish"), tags: TAGS } })
    .input(publishInputSchema)
    .output(formOutputSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        return await formService.publish(ctx.user.id, input.id, input.visibility);
      } catch (error) {
        mapFormServiceError(error);
      }
    }),
  unpublish: protectedProcedure
    .meta({ openapi: { method: "POST", path: getPath("/{id}/unpublish"), tags: TAGS } })
    .input(idInputSchema)
    .output(formOutputSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        return await formService.unpublish(ctx.user.id, input.id);
      } catch (error) {
        mapFormServiceError(error);
      }
    }),
  archive: protectedProcedure
    .meta({ openapi: { method: "POST", path: getPath("/{id}/archive"), tags: TAGS } })
    .input(idInputSchema)
    .output(formOutputSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        return await formService.archive(ctx.user.id, input.id);
      } catch (error) {
        mapFormServiceError(error);
      }
    }),
  unarchive: protectedProcedure
    .meta({ openapi: { method: "POST", path: getPath("/{id}/unarchive"), tags: TAGS } })
    .input(idInputSchema)
    .output(formOutputSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        return await formService.unarchive(ctx.user.id, input.id);
      } catch (error) {
        mapFormServiceError(error);
      }
    }),
  delete: protectedProcedure
    .meta({ openapi: { method: "DELETE", path: getPath("/{id}"), tags: TAGS } })
    .input(idInputSchema)
    .output(z.object({ success: z.literal(true) }))
    .mutation(async ({ input, ctx }) => {
      try {
        return await formService.delete(ctx.user.id, input.id);
      } catch (error) {
        mapFormServiceError(error);
      }
    }),
  clone: protectedProcedure
    .meta({ openapi: { method: "POST", path: getPath("/{id}/clone"), tags: TAGS } })
    .input(idInputSchema)
    .output(formOutputSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        return await formService.clone(ctx.user.id, input.id);
      } catch (error) {
        mapFormServiceError(error);
      }
    }),
  setPassword: protectedProcedure
    .meta({ openapi: { method: "POST", path: getPath("/{id}/password"), tags: TAGS } })
    .input(setPasswordInputSchema)
    .output(formOutputSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        return await formService.setPassword(ctx.user.id, input.id, input.password);
      } catch (error) {
        mapFormServiceError(error);
      }
    }),
  getPublic: publicProcedure
    .meta({ openapi: { method: "GET", path: getPath("/public/{slug}"), tags: TAGS } })
    .input(publicInputSchema)
    .output(z.object({ form: publicFormOutputSchema, fields: z.array(fieldOutputSchema) }))
    .query(async ({ input, ctx }) => {
      try {
        const ipHash = hashIp(ctx.ip);
        const limit = consume(`getPublic:${ipHash}`, { capacity: 60, refillPerSec: 1 });
        if (!limit.ok) {
          throw new TRPCError({ code: "TOO_MANY_REQUESTS", message: "Too many requests" });
        }

        return await formService.getPublic(input.slug, input.password);
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        mapFormServiceError(error);
      }
    }),
});
