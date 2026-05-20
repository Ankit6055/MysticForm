import { TRPCError } from "@trpc/server";
import { z } from "../../schema";
import { responseService } from "../../services";
import { protectedProcedure, publicProcedure, router } from "../../trpc";
import { generatePath } from "../../utils/path-generator";
import { ResponseServiceError } from "@repo/services/response";

const TAGS = ["Responses"];
const getPath = generatePath("/responses");

const responseOutputSchema = z.object({
  id: z.uuid(),
  formId: z.uuid(),
  answers: z.record(z.string(), z.unknown()),
  respondentEmail: z.string().nullable(),
  ipHash: z.string().nullable(),
  userAgent: z.string().nullable(),
  createdAt: z.date().nullable(),
  deletedAt: z.date().nullable(),
});

const submitInputSchema = z.object({
  formSlug: z.string().min(3).max(80),
  password: z.string().max(200).optional(),
  answers: z.record(z.string(), z.unknown()),
  website: z.string().max(500).optional(),
});

const listInputSchema = z.object({
  formId: z.uuid(),
  cursor: z.string().optional(),
  limit: z.number().int().positive().max(100).default(25),
  search: z.string().trim().min(1).max(120).optional(),
});

const idInputSchema = z.object({ id: z.uuid() });
const bulkDeleteInputSchema = z.object({ ids: z.array(z.uuid()).min(1).max(100) });
const exportCsvInputSchema = z.object({ formId: z.uuid() });

function mapResponseServiceError(error: unknown): never {
  if (error instanceof ResponseServiceError) {
    throw new TRPCError({
      code: error.code,
      message: error.message,
      cause: error.cause,
    });
  }

  throw error;
}

export const responsesRouter = router({
  submit: publicProcedure
    .meta({ openapi: { method: "POST", path: getPath("/submit"), tags: TAGS } })
    .input(submitInputSchema)
    .output(z.object({ id: z.uuid(), thankYouMessage: z.string().nullable() }))
    .mutation(async ({ input, ctx }) => {
      try {
        return await responseService.submit({
          ...input,
          ip: ctx.ip,
          userAgent: ctx.userAgent,
        });
      } catch (error) {
        mapResponseServiceError(error);
      }
    }),
  list: protectedProcedure
    .meta({ openapi: { method: "GET", path: getPath("/list"), tags: TAGS } })
    .input(listInputSchema)
    .output(
      z.object({
        items: z.array(responseOutputSchema),
        nextCursor: z.string().nullable(),
      }),
    )
    .query(async ({ input, ctx }) => {
      try {
        return await responseService.list({
          ownerId: ctx.user.id,
          formId: input.formId,
          cursor: input.cursor,
          limit: input.limit,
          search: input.search,
        });
      } catch (error) {
        mapResponseServiceError(error);
      }
    }),
  get: protectedProcedure
    .meta({ openapi: { method: "GET", path: getPath("/{id}"), tags: TAGS } })
    .input(idInputSchema)
    .output(responseOutputSchema)
    .query(async ({ input, ctx }) => {
      try {
        return await responseService.get(ctx.user.id, input.id);
      } catch (error) {
        mapResponseServiceError(error);
      }
    }),
  delete: protectedProcedure
    .meta({ openapi: { method: "DELETE", path: getPath("/{id}"), tags: TAGS } })
    .input(idInputSchema)
    .output(z.object({ success: z.literal(true) }))
    .mutation(async ({ input, ctx }) => {
      try {
        return await responseService.delete(ctx.user.id, input.id);
      } catch (error) {
        mapResponseServiceError(error);
      }
    }),
  bulkDelete: protectedProcedure
    .meta({ openapi: { method: "POST", path: getPath("/bulk-delete"), tags: TAGS } })
    .input(bulkDeleteInputSchema)
    .output(z.object({ success: z.literal(true), deletedCount: z.number().int().nonnegative() }))
    .mutation(async ({ input, ctx }) => {
      try {
        return await responseService.bulkDelete(ctx.user.id, input.ids);
      } catch (error) {
        mapResponseServiceError(error);
      }
    }),
  exportCsv: protectedProcedure
    .meta({ openapi: { method: "GET", path: getPath("/export-csv/{formId}"), tags: TAGS } })
    .input(exportCsvInputSchema)
    .output(z.object({ filename: z.string(), csv: z.string() }))
    .query(async ({ input, ctx }) => {
      try {
        return await responseService.exportCsv(ctx.user.id, input.formId);
      } catch (error) {
        mapResponseServiceError(error);
      }
    }),
});
