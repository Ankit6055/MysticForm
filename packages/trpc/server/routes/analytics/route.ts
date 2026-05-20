import { TRPCError } from "@trpc/server";
import { AnalyticsServiceError } from "@repo/services/analytics";
import { z } from "../../schema";
import { analyticsService } from "../../services";
import { protectedProcedure, router } from "../../trpc";
import { generatePath } from "../../utils/path-generator";

const TAGS = ["Analytics"];
const getPath = generatePath("/analytics");

const formIdInputSchema = z.object({ formId: z.uuid() });

const optionBucketSchema = z.object({
  value: z.string(),
  label: z.string(),
  count: z.number().int().nonnegative(),
});

const breakdownItemSchema = z.discriminatedUnion("type", [
  z.object({
    fieldId: z.uuid(),
    type: z.enum(["single_select", "multi_select", "checkbox", "dropdown"]),
    label: z.string(),
    buckets: z.array(optionBucketSchema),
  }),
  z.object({
    fieldId: z.uuid(),
    type: z.literal("rating"),
    label: z.string(),
    average: z.number(),
    distribution: z.array(z.object({ value: z.number().int().positive(), count: z.number().int().nonnegative() })),
  }),
  z.object({
    fieldId: z.uuid(),
    type: z.enum(["short_text", "long_text", "email", "number", "date"]),
    label: z.string(),
    responseCount: z.number().int().nonnegative(),
  }),
]);

function mapAnalyticsServiceError(error: unknown): never {
  if (error instanceof AnalyticsServiceError) {
    throw new TRPCError({ code: error.code, message: error.message });
  }

  throw error;
}

export const analyticsRouter = router({
  summary: protectedProcedure
    .meta({ openapi: { method: "GET", path: getPath("/summary/{formId}"), tags: TAGS } })
    .input(formIdInputSchema)
    .output(
      z.object({
        totalResponses: z.number().int().nonnegative(),
        last7DaysCount: z.number().int().nonnegative(),
        last30DaysCount: z.number().int().nonnegative(),
        firstResponseAt: z.date().nullable(),
        lastResponseAt: z.date().nullable(),
        responsesByDay: z.array(
          z.object({
            date: z.string(),
            count: z.number().int().nonnegative(),
          }),
        ),
      }),
    )
    .query(async ({ input, ctx }) => {
      try {
        return await analyticsService.summary(ctx.user.id, input.formId);
      } catch (error) {
        mapAnalyticsServiceError(error);
      }
    }),
  fieldBreakdown: protectedProcedure
    .meta({ openapi: { method: "GET", path: getPath("/field-breakdown/{formId}"), tags: TAGS } })
    .input(formIdInputSchema)
    .output(z.array(breakdownItemSchema))
    .query(async ({ input, ctx }) => {
      try {
        return await analyticsService.fieldBreakdown(ctx.user.id, input.formId);
      } catch (error) {
        mapAnalyticsServiceError(error);
      }
    }),
});
