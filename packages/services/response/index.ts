import { randomUUID } from "node:crypto";
import bcrypt from "bcryptjs";
import {
  and,
  asc,
  count,
  db,
  desc,
  eq,
  ilike,
  inArray,
  lt,
  or,
  sql,
} from "@repo/database";
import {
  formFieldsTable,
  formsTable,
  responsesTable,
  SelectForm,
  SelectFormField,
  SelectResponse,
} from "@repo/database/schema";
import { buildResponseSchema, FormField } from "@repo/schemas";
import { consume, hashIp } from "../rate-limit";
import { serializeCsv } from "../utils/csv";

export class ResponseServiceError extends Error {
  constructor(
    public readonly code:
      | "BAD_REQUEST"
      | "NOT_FOUND"
      | "TOO_MANY_REQUESTS",
    message: string,
    public readonly cause?: unknown,
  ) {
    super(message);
  }
}

type PublicForm = SelectForm & { fields: SelectFormField[] };

type SubmitInput = {
  formSlug: string;
  password?: string;
  answers: Record<string, unknown>;
  website?: string;
  ip: string;
  userAgent: string | null;
};

type ListInput = {
  ownerId: string;
  formId: string;
  cursor?: string;
  limit: number;
  search?: string;
};

function normalizeField(field: SelectFormField): FormField {
  return {
    id: field.id,
    order: field.order,
    type: field.type,
    label: field.label,
    helpText: field.helpText ?? undefined,
    required: field.required ?? false,
    config: field.config,
  } as FormField;
}

function encodeCursor(response: Pick<SelectResponse, "createdAt" | "id">) {
  return Buffer.from(
    JSON.stringify({ createdAt: response.createdAt?.toISOString() ?? "", id: response.id }),
  ).toString("base64url");
}

function decodeCursor(cursor: string) {
  try {
    const parsed = JSON.parse(Buffer.from(cursor, "base64url").toString("utf8")) as {
      createdAt?: string;
      id?: string;
    };
    if (!parsed.createdAt || !parsed.id) return null;
    return { createdAt: new Date(parsed.createdAt), id: parsed.id };
  } catch {
    return null;
  }
}

function formatDateForFilename(date: Date) {
  return date.toISOString().slice(0, 10);
}

class ResponseService {
  public async submit(input: SubmitInput) {
    const publicForm = await this.getPublicForm(input.formSlug, input.password);
    const ipHash = hashIp(input.ip);
    const globalLimit = consume(`global:${ipHash}`, { capacity: 30, refillPerSec: 0.5 });
    const formLimit = consume(`form:${publicForm.id}:${ipHash}`, {
      capacity: 5,
      refillPerSec: 1 / 12,
    });

    if (!globalLimit.ok || !formLimit.ok) {
      throw new ResponseServiceError("TOO_MANY_REQUESTS", "Too many submissions");
    }

    if (input.website?.trim()) {
      return {
        id: randomUUID(),
        thankYouMessage: publicForm.thankYouMessage,
      };
    }

    const fields = publicForm.fields.map(normalizeField);
    const parsedAnswers = buildResponseSchema(fields).safeParse(input.answers);
    if (!parsedAnswers.success) {
      throw new ResponseServiceError("BAD_REQUEST", parsedAnswers.error.message, parsedAnswers.error);
    }

    const response = await db.transaction(async (tx) => {
      if (publicForm.responseLimit !== null) {
        const [result] = await tx
          .select({ value: count(responsesTable.id) })
          .from(responsesTable)
          .where(eq(responsesTable.formId, publicForm.id));

        if ((result?.value ?? 0) >= publicForm.responseLimit) {
          throw new ResponseServiceError("NOT_FOUND", "Form unavailable");
        }
      }

      const [created] = await tx
        .insert(responsesTable)
        .values({
          formId: publicForm.id,
          answers: parsedAnswers.data,
          respondentEmail: this.captureRespondentEmail(publicForm.fields, parsedAnswers.data),
          ipHash,
          userAgent: input.userAgent,
        })
        .returning();

      if (!created) throw new ResponseServiceError("BAD_REQUEST", "Unable to save response");
      return created;
    });

    return {
      id: response.id,
      thankYouMessage: publicForm.thankYouMessage,
    };
  }

  public async list(input: ListInput) {
    await this.getOwnedForm(input.ownerId, input.formId);
    const cursor = input.cursor ? decodeCursor(input.cursor) : null;
    const filters = [
      eq(responsesTable.formId, input.formId),
      input.search
        ? or(
            ilike(responsesTable.respondentEmail, `%${input.search}%`),
            sql`${responsesTable.answers}::text ilike ${`%${input.search}%`}`,
          )
        : undefined,
      cursor
        ? or(
            lt(responsesTable.createdAt, cursor.createdAt),
            and(eq(responsesTable.createdAt, cursor.createdAt), lt(responsesTable.id, cursor.id)),
          )
        : undefined,
    ].filter(Boolean);

    const rows = await db
      .select()
      .from(responsesTable)
      .where(and(...filters))
      .orderBy(desc(responsesTable.createdAt), desc(responsesTable.id))
      .limit(input.limit + 1);

    const items = rows.slice(0, input.limit);
    return {
      items,
      nextCursor: rows.length > input.limit ? encodeCursor(rows[input.limit]!) : null,
    };
  }

  public async get(ownerId: string, id: string) {
    const [response] = await db
      .select()
      .from(responsesTable)
      .innerJoin(formsTable, eq(formsTable.id, responsesTable.formId))
      .where(and(eq(responsesTable.id, id), eq(formsTable.ownerId, ownerId)))
      .limit(1);

    if (!response) throw new ResponseServiceError("NOT_FOUND", "Response not found");
    return response.responses;
  }

  public async delete(ownerId: string, id: string) {
    await this.get(ownerId, id);
    await db.delete(responsesTable).where(eq(responsesTable.id, id));
    return { success: true as const };
  }

  public async bulkDelete(ownerId: string, ids: string[]) {
    if (ids.length === 0) return { success: true as const, deletedCount: 0 };

    const owned = await db
      .select({ id: responsesTable.id })
      .from(responsesTable)
      .innerJoin(formsTable, eq(formsTable.id, responsesTable.formId))
      .where(and(inArray(responsesTable.id, ids), eq(formsTable.ownerId, ownerId)));

    if (owned.length !== ids.length) {
      throw new ResponseServiceError("NOT_FOUND", "Response not found");
    }

    await db.delete(responsesTable).where(inArray(responsesTable.id, ids));
    return { success: true as const, deletedCount: ids.length };
  }

  public async exportCsv(ownerId: string, formId: string) {
    const form = await this.getOwnedForm(ownerId, formId);
    const fields = await this.getFields(formId);
    const responses = await db
      .select()
      .from(responsesTable)
      .where(eq(responsesTable.formId, formId))
      .orderBy(asc(responsesTable.createdAt), asc(responsesTable.id));

    const header = ["submitted_at", "respondent_email", ...fields.map((field) => field.label)];
    const rows = responses.map((response) => [
      response.createdAt,
      response.respondentEmail,
      ...fields.map((field) => response.answers[field.id]),
    ]);

    return {
      filename: `${form.slug}-responses-${formatDateForFilename(new Date())}.csv`,
      csv: serializeCsv([header, ...rows]),
    };
  }

  private async getOwnedForm(ownerId: string, formId: string) {
    const [form] = await db
      .select()
      .from(formsTable)
      .where(and(eq(formsTable.id, formId), eq(formsTable.ownerId, ownerId)))
      .limit(1);

    if (!form) throw new ResponseServiceError("NOT_FOUND", "Form not found");
    return form;
  }

  private async getPublicForm(slug: string, password?: string): Promise<PublicForm> {
    const [form] = await db.select().from(formsTable).where(eq(formsTable.slug, slug)).limit(1);
    if (!form || form.status === "archived" || form.visibility === "draft") {
      throw new ResponseServiceError("NOT_FOUND", "Form unavailable");
    }

    if (form.expiresAt && form.expiresAt <= new Date()) {
      throw new ResponseServiceError("NOT_FOUND", "Form unavailable");
    }

    if (form.responseLimit !== null) {
      const [result] = await db
        .select({ value: count(responsesTable.id) })
        .from(responsesTable)
        .where(eq(responsesTable.formId, form.id));

      if ((result?.value ?? 0) >= form.responseLimit) {
        throw new ResponseServiceError("NOT_FOUND", "Form unavailable");
      }
    }

    if (form.passwordHash) {
      const isValid = password ? await bcrypt.compare(password, form.passwordHash) : false;
      if (!isValid) throw new ResponseServiceError("BAD_REQUEST", "FORM_PASSWORD_REQUIRED");
    }

    return {
      ...form,
      fields: await this.getFields(form.id),
    };
  }

  private async getFields(formId: string) {
    return db
      .select()
      .from(formFieldsTable)
      .where(eq(formFieldsTable.formId, formId))
      .orderBy(asc(formFieldsTable.order));
  }

  private captureRespondentEmail(fields: SelectFormField[], answers: Record<string, unknown>) {
    const emailField = fields.find((field) => field.type === "email");
    const value = emailField ? answers[emailField.id] : null;
    return typeof value === "string" ? value : null;
  }
}

export default ResponseService;
