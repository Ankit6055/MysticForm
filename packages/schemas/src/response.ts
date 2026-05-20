import { z } from "zod";
import { FormField } from "./field.js";

function withTextRules(
  schema: z.ZodString,
  config: { minLength?: number; maxLength?: number; pattern?: string },
) {
  let next = schema;
  if (config.minLength !== undefined) next = next.min(config.minLength);
  if (config.maxLength !== undefined) next = next.max(config.maxLength);
  if (config.pattern) next = next.regex(new RegExp(config.pattern));
  return next;
}

function enumFromValues(values: string[]) {
  return z.string().refine((value) => values.includes(value), {
    message: "Invalid option",
  });
}

function buildFieldAnswerSchema(field: FormField): z.ZodTypeAny {
  switch (field.type) {
    case "short_text":
    case "long_text":
      return withTextRules(z.string(), field.config);
    case "email":
      return withTextRules(z.string(), field.config).pipe(z.email());
    case "number": {
      let schema = z.number();
      if (field.config.min !== undefined) schema = schema.min(field.config.min);
      if (field.config.max !== undefined) schema = schema.max(field.config.max);
      return schema;
    }
    case "single_select":
    case "dropdown":
      return enumFromValues(field.config.options.map((option) => option.value));
    case "multi_select": {
      let schema = z.array(enumFromValues(field.config.options.map((option) => option.value)));
      if (field.config.minSelected !== undefined) schema = schema.min(field.config.minSelected);
      if (field.config.maxSelected !== undefined) schema = schema.max(field.config.maxSelected);
      return schema;
    }
    case "checkbox":
      return z.boolean();
    case "rating":
      return z.number().int().min(1).max(field.config.scale);
    case "date":
      return z.iso.date();
    default:
      field satisfies never;
      throw new Error("Unsupported field type");
  }
}

export function buildResponseSchema(fields: FormField[]) {
  const shape: Record<string, z.ZodTypeAny> = {};

  for (const field of fields) {
    const answerSchema = buildFieldAnswerSchema(field);
    shape[field.id] = field.required ? answerSchema : answerSchema.optional().nullable();
  }

  return z.object(shape);
}

export type ResponseAnswers = z.infer<ReturnType<typeof buildResponseSchema>>;
