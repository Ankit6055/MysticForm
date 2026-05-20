import { and, count, db, eq, gte, sql } from "@repo/database";
import { formFieldsTable, formsTable, responsesTable, SelectFormField } from "@repo/database/schema";

export class AnalyticsServiceError extends Error {
  constructor(
    public readonly code: "NOT_FOUND",
    message: string,
  ) {
    super(message);
  }
}

type Option = { value: string; label: string };

function dateKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

function toDate(value: Date | string | null | undefined) {
  if (!value) return null;
  return value instanceof Date ? value : new Date(value);
}

function startOfUtcDay(date: Date) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

function getOptions(field: SelectFormField): Option[] {
  const config = field.config as { options?: Option[] };
  return Array.isArray(config.options) ? config.options : [];
}

function createOptionBuckets(field: SelectFormField) {
  if (field.type === "checkbox") {
    return [
      { value: "true", label: "Checked", count: 0 },
      { value: "false", label: "Unchecked", count: 0 },
    ];
  }

  return getOptions(field).map((option) => ({ ...option, count: 0 }));
}

class AnalyticsService {
  public async summary(ownerId: string, formId: string) {
    await this.getOwnedForm(ownerId, formId);

    const now = new Date();
    const today = startOfUtcDay(now);
    const firstDay = new Date(today);
    firstDay.setUTCDate(firstDay.getUTCDate() - 29);
    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setUTCDate(sevenDaysAgo.getUTCDate() - 7);
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setUTCDate(thirtyDaysAgo.getUTCDate() - 30);

    const [totals] = await db
      .select({
        totalResponses: count(responsesTable.id),
        firstResponseAt: sql<Date | null>`min(${responsesTable.createdAt})`,
        lastResponseAt: sql<Date | null>`max(${responsesTable.createdAt})`,
      })
      .from(responsesTable)
      .where(eq(responsesTable.formId, formId));

    const [last7Days] = await db
      .select({ value: count(responsesTable.id) })
      .from(responsesTable)
      .where(and(eq(responsesTable.formId, formId), gte(responsesTable.createdAt, sevenDaysAgo)));

    const [last30Days] = await db
      .select({ value: count(responsesTable.id) })
      .from(responsesTable)
      .where(and(eq(responsesTable.formId, formId), gte(responsesTable.createdAt, thirtyDaysAgo)));

    const rawByDay = await db
      .select({
        date: sql<string>`date_trunc('day', ${responsesTable.createdAt})::date`,
        value: count(responsesTable.id),
      })
      .from(responsesTable)
      .where(and(eq(responsesTable.formId, formId), gte(responsesTable.createdAt, firstDay)))
      .groupBy(sql`date_trunc('day', ${responsesTable.createdAt})::date`);

    const countsByDay = new Map(rawByDay.map((row) => [row.date, row.value]));
    const responsesByDay = Array.from({ length: 30 }, (_, index) => {
      const date = new Date(firstDay);
      date.setUTCDate(firstDay.getUTCDate() + index);
      const key = dateKey(date);
      return { date: key, count: countsByDay.get(key) ?? 0 };
    });

    return {
      totalResponses: totals?.totalResponses ?? 0,
      last7DaysCount: last7Days?.value ?? 0,
      last30DaysCount: last30Days?.value ?? 0,
      firstResponseAt: toDate(totals?.firstResponseAt),
      lastResponseAt: toDate(totals?.lastResponseAt),
      responsesByDay,
    };
  }

  public async fieldBreakdown(ownerId: string, formId: string) {
    await this.getOwnedForm(ownerId, formId);
    const fields = await db
      .select()
      .from(formFieldsTable)
      .where(eq(formFieldsTable.formId, formId))
      .orderBy(formFieldsTable.order);
    const responses = await db
      .select({ answers: responsesTable.answers })
      .from(responsesTable)
      .where(eq(responsesTable.formId, formId));

    return fields.map((field) => this.breakdownField(field, responses.map((response) => response.answers)));
  }

  private breakdownField(field: SelectFormField, answersList: Record<string, unknown>[]) {
    if (field.type === "single_select" || field.type === "dropdown" || field.type === "checkbox") {
      const buckets = createOptionBuckets(field);
      const bucketByValue = new Map(buckets.map((bucket) => [bucket.value, bucket]));

      for (const answers of answersList) {
        const value = answers[field.id];
        if (typeof value === "string") {
          const bucket = bucketByValue.get(value);
          if (bucket) bucket.count += 1;
        }
        if (typeof value === "boolean") {
          const booleanValue = String(value);
          const bucket = bucketByValue.get(booleanValue);
          if (bucket) bucket.count += 1;
        }
      }

      return { fieldId: field.id, type: field.type, label: field.label, buckets };
    }

    if (field.type === "multi_select") {
      const buckets = createOptionBuckets(field);
      const bucketByValue = new Map(buckets.map((bucket) => [bucket.value, bucket]));

      for (const answers of answersList) {
        const value = answers[field.id];
        if (!Array.isArray(value)) continue;
        for (const item of value) {
          if (typeof item === "string") {
            const bucket = bucketByValue.get(item);
            if (bucket) bucket.count += 1;
          }
        }
      }

      return { fieldId: field.id, type: field.type, label: field.label, buckets };
    }

    if (field.type === "rating") {
      const config = field.config as { scale?: number };
      const scale = config.scale ?? 5;
      const distribution = Array.from({ length: scale }, (_, index) => ({
        value: index + 1,
        count: 0,
      }));
      let total = 0;
      let responseCount = 0;

      for (const answers of answersList) {
        const value = answers[field.id];
        if (typeof value !== "number" || value < 1 || value > scale) continue;
        distribution[value - 1]!.count += 1;
        total += value;
        responseCount += 1;
      }

      return {
        fieldId: field.id,
        type: field.type,
        label: field.label,
        average: responseCount > 0 ? total / responseCount : 0,
        distribution,
      };
    }

    return {
      fieldId: field.id,
      type: field.type,
      label: field.label,
      responseCount: answersList.filter((answers) => answers[field.id] !== undefined && answers[field.id] !== null)
        .length,
    };
  }

  private async getOwnedForm(ownerId: string, formId: string) {
    const [form] = await db
      .select({ id: formsTable.id })
      .from(formsTable)
      .where(and(eq(formsTable.id, formId), eq(formsTable.ownerId, ownerId)))
      .limit(1);

    if (!form) throw new AnalyticsServiceError("NOT_FOUND", "Form not found");
    return form;
  }
}

export default AnalyticsService;
