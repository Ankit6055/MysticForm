import { z } from "zod";

const optionSchema = z.object({
  value: z.string().min(1).max(120),
  label: z.string().min(1).max(200),
});

const textConfigSchema = z.object({
  minLength: z.number().int().nonnegative().optional(),
  maxLength: z.number().int().positive().optional(),
  placeholder: z.string().max(200).optional(),
  pattern: z.string().max(500).optional(),
});

export const fieldConfigByType = {
  short_text: z.object({ type: z.literal("short_text"), config: textConfigSchema.default({}) }),
  long_text: z.object({ type: z.literal("long_text"), config: textConfigSchema.default({}) }),
  email: z.object({ type: z.literal("email"), config: textConfigSchema.default({}) }),
  number: z.object({
    type: z.literal("number"),
    config: z
      .object({
        min: z.number().optional(),
        max: z.number().optional(),
        step: z.number().positive().optional(),
        placeholder: z.string().max(200).optional(),
      })
      .default({}),
  }),
  single_select: z.object({
    type: z.literal("single_select"),
    config: z.object({ options: z.array(optionSchema).min(1) }),
  }),
  dropdown: z.object({
    type: z.literal("dropdown"),
    config: z.object({ options: z.array(optionSchema).min(1) }),
  }),
  multi_select: z.object({
    type: z.literal("multi_select"),
    config: z.object({
      options: z.array(optionSchema).min(1),
      minSelected: z.number().int().nonnegative().optional(),
      maxSelected: z.number().int().positive().optional(),
    }),
  }),
  checkbox: z.object({
    type: z.literal("checkbox"),
    config: z.object({ defaultChecked: z.boolean().optional() }).default({}),
  }),
  rating: z.object({
    type: z.literal("rating"),
    config: z.object({
      scale: z.union([z.literal(3), z.literal(5), z.literal(7), z.literal(10)]),
      icon: z.enum(["star", "heart", "thumb"]).optional(),
    }),
  }),
  date: z.object({
    type: z.literal("date"),
    config: z
      .object({
        min: z.iso.date().optional(),
        max: z.iso.date().optional(),
      })
      .default({}),
  }),
} as const;

export const fieldConfigSchema = z.discriminatedUnion("type", [
  fieldConfigByType.short_text,
  fieldConfigByType.long_text,
  fieldConfigByType.email,
  fieldConfigByType.number,
  fieldConfigByType.single_select,
  fieldConfigByType.multi_select,
  fieldConfigByType.checkbox,
  fieldConfigByType.dropdown,
  fieldConfigByType.rating,
  fieldConfigByType.date,
]);

const baseFieldSchema = z.object({
  id: z.uuid(),
  order: z.number().int().nonnegative(),
  label: z.string().min(1).max(200),
  helpText: z.string().max(500).optional(),
  required: z.boolean(),
});

export const formFieldSchema = z.intersection(baseFieldSchema, fieldConfigSchema);

export type FieldOption = z.infer<typeof optionSchema>;
export type FieldConfig = z.infer<typeof fieldConfigSchema>;
export type FormField = z.infer<typeof formFieldSchema>;
export type FieldType = FormField["type"];
