"use client";

import { useState } from "react";
import { Button } from "~/components/ui/button";
import { FieldRenderer } from "./field-renderer";
import type { BuilderField } from "~/hooks/use-form-builder";

interface FormRendererProps {
  title: string;
  description?: string | null;
  fields: BuilderField[];
  submitLabel?: string | null;
  thankYouMessage?: string | null;
  onSubmit?: (values: Record<string, unknown>) => void;
  isPreview?: boolean;
}

export function FormRenderer({
  title,
  description,
  fields,
  submitLabel,
  thankYouMessage,
  onSubmit,
  isPreview,
}: FormRendererProps) {
  const [values, setValues] = useState<Record<string, unknown>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  function handleFieldChange(id: string, value: unknown) {
    setValues((prev) => ({ ...prev, [id]: value }));
    if (errors[id]) setErrors((prev) => ({ ...prev, [id]: "" }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const newErrors: Record<string, string> = {};
    for (const field of fields) {
      if (field.required) {
        const v = values[field.id];
        if (
          v === undefined ||
          v === null ||
          v === "" ||
          (Array.isArray(v) && v.length === 0) ||
          (field.type === "checkbox" && !v) ||
          (field.type === "rating" && !v)
        ) {
          newErrors[field.id] = "This field is required";
        }
      }
    }
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    if (onSubmit) {
      onSubmit(values);
    }
    if (!isPreview) setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="flex min-h-full flex-col items-center justify-center px-6 py-20 text-center">
        <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 text-3xl">
          ✓
        </div>
        <h2 className="text-2xl font-semibold text-[#1a1812]">Thank you!</h2>
        <p className="mt-3 max-w-sm text-[#5f5a4e]">
          {thankYouMessage ?? "Your response has been recorded."}
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-xl px-6 py-12">
      {/* Form header */}
      <div className="mb-10">
        <h1 className="text-2xl font-semibold tracking-tight text-[#1a1812]">{title}</h1>
        {description && (
          <p className="mt-2 text-sm leading-relaxed text-[#5f5a4e]">{description}</p>
        )}
      </div>

      {/* Fields */}
      <form onSubmit={handleSubmit} className="space-y-8" noValidate>
        {fields.map((field) => (
          <FieldRenderer
            key={field.id}
            field={field}
            value={values[field.id]}
            onChange={(v) => handleFieldChange(field.id, v)}
            error={errors[field.id]}
          />
        ))}

        {fields.length === 0 && (
          <p className="py-12 text-center text-sm text-[#9a9080]">
            No fields yet — add some in the builder.
          </p>
        )}

        {fields.length > 0 && (
          <div className="pt-4">
            <Button
              type="submit"
              className="bg-[#0f0e0b] text-[#f4c95d] hover:bg-[#2a2520] px-8"
            >
              {submitLabel ?? "Submit"}
            </Button>
            {isPreview && (
              <p className="mt-3 text-xs text-[#9a9080]">
                Preview mode — responses won't be saved.
              </p>
            )}
          </div>
        )}
      </form>
    </div>
  );
}
