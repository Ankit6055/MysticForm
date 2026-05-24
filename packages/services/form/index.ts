import bcrypt from "bcryptjs";
import {
  and,
  count,
  db,
  desc,
  eq,
  ilike,
  ne,
  or,
} from "@repo/database";
import {
  formFieldsTable,
  formsTable,
  responsesTable,
  SelectForm,
  SelectFormField,
} from "@repo/database/schema";

export class FormServiceError extends Error {
  constructor(
    public readonly code: "BAD_REQUEST" | "CONFLICT" | "NOT_FOUND" | "UNAUTHORIZED",
    message: string,
  ) {
    super(message);
  }
}

export type FormFieldInput = {
  id: string;
  type: SelectFormField["type"];
  label: string;
  order: number;
  required: boolean;
  config: Record<string, unknown>;
  helpText?: string;
};

export type FormMetadataInput = {
  title: string;
  slug: string;
  visibility: SelectForm["visibility"];
  description?: string;
  coverEmoji?: string;
  submitLabel?: string;
  thankYouMessage?: string;
  notifyRespondent?: boolean;
  responseLimit?: number | null;
  expiresAt?: string | null;
  themeId?: string | null;
};

function slugify(value: string) {
  const slug = value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);

  return slug || "form";
}

function shortId(length = 6) {
  const alphabet = "abcdefghijklmnopqrstuvwxyz0123456789";
  let value = "";
  for (let index = 0; index < length; index += 1) {
    value += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return value;
}

function toDate(value?: string | null) {
  return value ? new Date(value) : null;
}

function normalizeNullable<T>(value: T | undefined | null) {
  return value ?? null;
}

class FormService {
  public async list(input: {
    ownerId: string;
    status?: SelectForm["status"];
    search?: string;
  }) {
    const filters = [
      eq(formsTable.ownerId, input.ownerId),
      input.status ? eq(formsTable.status, input.status) : undefined,
      input.search ? ilike(formsTable.title, `%${input.search}%`) : undefined,
    ].filter(Boolean);

    return db
      .select({
        form: formsTable,
        responseCount: count(responsesTable.id),
      })
      .from(formsTable)
      .leftJoin(responsesTable, eq(responsesTable.formId, formsTable.id))
      .where(and(...filters))
      .groupBy(formsTable.id)
      .orderBy(desc(formsTable.updatedAt));
  }

  public async get(ownerId: string, id: string) {
    const form = await this.getOwnedForm(ownerId, id);
    const fields = await this.getFields(id);
    return { form, fields };
  }

  public async create(input: { ownerId: string; title: string; slug?: string }) {
    const slug = input.slug ?? (await this.generateSlug(input.title));
    await this.ensureSlugAvailable(slug);

    const [form] = await db
      .insert(formsTable)
      .values({
        ownerId: input.ownerId,
        title: input.title,
        slug,
      })
      .returning();

    if (!form) throw new FormServiceError("BAD_REQUEST", "Unable to create form");
    return form;
  }

  public async update(ownerId: string, id: string, metadata: FormMetadataInput) {
    const current = await this.getOwnedForm(ownerId, id);
    if (current.slug !== metadata.slug) {
      await this.ensureSlugAvailable(metadata.slug, id);
    }

    const [form] = await db
      .update(formsTable)
      .set({
        title: metadata.title,
        description: normalizeNullable(metadata.description),
        slug: metadata.slug,
        visibility: metadata.visibility,
        coverEmoji: normalizeNullable(metadata.coverEmoji),
        submitLabel: metadata.submitLabel ?? "Submit",
        thankYouMessage: normalizeNullable(metadata.thankYouMessage),
        notifyRespondent: metadata.notifyRespondent ?? false,
        responseLimit: metadata.responseLimit ?? null,
        expiresAt: toDate(metadata.expiresAt),
        themeId: metadata.themeId ?? null,
      })
      .where(eq(formsTable.id, current.id))
      .returning();

    if (!form) throw new FormServiceError("BAD_REQUEST", "Unable to update form");
    return form;
  }

  public async updateFields(ownerId: string, id: string, fields: FormFieldInput[]) {
    await this.getOwnedForm(ownerId, id);

    return db.transaction(async (tx) => {
      await tx.delete(formFieldsTable).where(eq(formFieldsTable.formId, id));

      if (fields.length === 0) return [];

      return tx
        .insert(formFieldsTable)
        .values(
          fields.map((field, index) => ({
            id: field.id,
            formId: id,
            type: field.type,
            label: field.label,
            helpText: normalizeNullable(field.helpText),
            required: field.required,
            order: index,
            config: field.config,
          })),
        )
        .returning();
    });
  }

  public async publish(ownerId: string, id: string, visibility: "public" | "unlisted") {
    const form = await this.getOwnedForm(ownerId, id);
    const fields = await this.getFields(id);
    if (fields.length === 0) {
      throw new FormServiceError("BAD_REQUEST", "Cannot publish a form with zero fields");
    }

    const [updated] = await db
      .update(formsTable)
      .set({
        visibility,
        publishedAt: form.publishedAt ?? new Date(),
      })
      .where(eq(formsTable.id, form.id))
      .returning();

    if (!updated) throw new FormServiceError("BAD_REQUEST", "Unable to publish form");
    return updated;
  }

  public async unpublish(ownerId: string, id: string) {
    return this.updateVisibility(ownerId, id, "draft");
  }

  public async archive(ownerId: string, id: string) {
    return this.updateStatus(ownerId, id, "archived");
  }

  public async unarchive(ownerId: string, id: string) {
    return this.updateStatus(ownerId, id, "active");
  }

  public async delete(ownerId: string, id: string) {
    await this.getOwnedForm(ownerId, id);
    await db.delete(formsTable).where(eq(formsTable.id, id));
    return { success: true as const };
  }

  public async clone(ownerId: string, id: string) {
    const { form, fields } = await this.getCloneSource(ownerId, id);
    const slug = await this.generateCopySlug(form.slug);

    return db.transaction(async (tx) => {
      const [copy] = await tx
        .insert(formsTable)
        .values({
          ownerId,
          themeId: form.themeId,
          title: `${form.title} Copy`.slice(0, 120),
          description: form.description,
          slug,
          visibility: "draft",
          status: "active",
          coverEmoji: form.coverEmoji,
          submitLabel: form.submitLabel,
          thankYouMessage: form.thankYouMessage,
          notifyRespondent: form.notifyRespondent,
          isTemplate: false,
          responseLimit: form.responseLimit,
          expiresAt: form.expiresAt,
        })
        .returning();

      if (!copy) throw new FormServiceError("BAD_REQUEST", "Unable to clone form");

      if (fields.length > 0) {
        await tx.insert(formFieldsTable).values(
          fields.map((field) => ({
            formId: copy.id,
            order: field.order,
            type: field.type,
            label: field.label,
            helpText: field.helpText,
            required: field.required,
            config: field.config,
          })),
        );
      }

      return copy;
    });
  }

  public async setPassword(ownerId: string, id: string, password: string | null) {
    const form = await this.getOwnedForm(ownerId, id);
    const passwordHash = password ? await bcrypt.hash(password, 10) : null;

    const [updated] = await db
      .update(formsTable)
      .set({ passwordHash })
      .where(eq(formsTable.id, form.id))
      .returning();

    if (!updated) throw new FormServiceError("BAD_REQUEST", "Unable to update password");
    return updated;
  }

  public async getPublic(slug: string, password?: string) {
    const [form] = await db.select().from(formsTable).where(eq(formsTable.slug, slug)).limit(1);
    if (!form || form.status === "archived" || form.visibility === "draft") {
      throw new FormServiceError("NOT_FOUND", "Form unavailable");
    }

    if (form.expiresAt && form.expiresAt <= new Date()) {
      throw new FormServiceError("NOT_FOUND", "Form unavailable");
    }

    if (form.responseLimit !== null) {
      const [result] = await db
        .select({ value: count(responsesTable.id) })
        .from(responsesTable)
        .where(eq(responsesTable.formId, form.id));

      if ((result?.value ?? 0) >= form.responseLimit) {
        throw new FormServiceError("NOT_FOUND", "Form unavailable");
      }
    }

    if (form.passwordHash) {
      const isValid = password ? await bcrypt.compare(password, form.passwordHash) : false;
      if (!isValid) {
        throw new FormServiceError("UNAUTHORIZED", "FORM_PASSWORD_REQUIRED");
      }
    }

    const fields = await this.getFields(form.id);
    return { form, fields };
  }

  private async updateVisibility(ownerId: string, id: string, visibility: SelectForm["visibility"]) {
    const form = await this.getOwnedForm(ownerId, id);
    const [updated] = await db
      .update(formsTable)
      .set({ visibility })
      .where(eq(formsTable.id, form.id))
      .returning();

    if (!updated) throw new FormServiceError("BAD_REQUEST", "Unable to update visibility");
    return updated;
  }

  private async updateStatus(ownerId: string, id: string, status: SelectForm["status"]) {
    const form = await this.getOwnedForm(ownerId, id);
    const [updated] = await db
      .update(formsTable)
      .set({ status })
      .where(eq(formsTable.id, form.id))
      .returning();

    if (!updated) throw new FormServiceError("BAD_REQUEST", "Unable to update status");
    return updated;
  }

  private async getOwnedForm(ownerId: string, id: string) {
    const [form] = await db
      .select()
      .from(formsTable)
      .where(and(eq(formsTable.id, id), eq(formsTable.ownerId, ownerId)))
      .limit(1);

    if (!form) throw new FormServiceError("NOT_FOUND", "Form not found");
    return form;
  }

  private async getCloneSource(ownerId: string, id: string) {
    const [form] = await db
      .select()
      .from(formsTable)
      .where(
        and(
          eq(formsTable.id, id),
          or(
            eq(formsTable.ownerId, ownerId),
            and(
              eq(formsTable.isTemplate, true),
              eq(formsTable.visibility, "public"),
              eq(formsTable.status, "active"),
            ),
          ),
        ),
      )
      .limit(1);

    if (!form) throw new FormServiceError("NOT_FOUND", "Form not found");
    const fields = await this.getFields(form.id);
    return { form, fields };
  }

  private async getFields(formId: string) {
    return db
      .select()
      .from(formFieldsTable)
      .where(eq(formFieldsTable.formId, formId))
      .orderBy(formFieldsTable.order);
  }

  private async ensureSlugAvailable(slug: string, excludingFormId?: string) {
    const filter = excludingFormId
      ? and(eq(formsTable.slug, slug), ne(formsTable.id, excludingFormId))
      : eq(formsTable.slug, slug);
    const [existing] = await db.select({ id: formsTable.id }).from(formsTable).where(filter).limit(1);

    if (existing) throw new FormServiceError("CONFLICT", "Slug already exists");
  }

  private async generateSlug(title: string) {
    for (let index = 0; index < 5; index += 1) {
      const slug = `${slugify(title)}-${shortId()}`;
      const [existing] = await db
        .select({ id: formsTable.id })
        .from(formsTable)
        .where(eq(formsTable.slug, slug))
        .limit(1);
      if (!existing) return slug;
    }

    throw new FormServiceError("CONFLICT", "Unable to generate a unique slug");
  }

  private async generateCopySlug(slug: string) {
    for (let index = 0; index < 5; index += 1) {
      const candidate = `${slug}-copy-${shortId()}`.slice(0, 80);
      const [existing] = await db
        .select({ id: formsTable.id })
        .from(formsTable)
        .where(eq(formsTable.slug, candidate))
        .limit(1);
      if (!existing) return candidate;
    }

    throw new FormServiceError("CONFLICT", "Unable to generate a unique clone slug");
  }
}

export default FormService;
