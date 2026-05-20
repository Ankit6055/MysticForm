"use client";

import { useState, useRef, useCallback } from "react";
import Link from "next/link";
import { Loader2, RotateCcw, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "~/trpc/client";
import { FieldRenderer } from "~/components/form-renderer/field-renderer";
import { buildResponseSchema } from "@repo/schemas";
import type { BuilderField } from "~/hooks/use-form-builder";
import type { RouterOutputs } from "@repo/trpc/client";
import type { FormField } from "@repo/schemas";

type PublicForm = RouterOutputs["forms"]["getPublic"]["form"];
type PublicField = RouterOutputs["forms"]["getPublic"]["fields"][number];

export interface ThemeTokens {
  background: string;
  foreground: string;
  accent: string;
  accentForeground: string;
  muted: string;
  font: string;
  radius: string;
}

function toBuilderField(f: PublicField): BuilderField {
  return {
    id: f.id,
    order: f.order,
    type: f.type as BuilderField["type"],
    label: f.label,
    helpText: f.helpText ?? undefined,
    required: f.required ?? false,
    config: f.config as Record<string, unknown>,
  };
}

function prepareAnswers(
  values: Record<string, unknown>,
  fields: PublicField[],
): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const field of fields) {
    const v = values[field.id];
    if (v === undefined || v === null || v === "") continue;
    if (field.type === "number" && typeof v === "string") {
      const n = parseFloat(v);
      if (!isNaN(n)) out[field.id] = n;
    } else {
      out[field.id] = v;
    }
  }
  return out;
}

// ── Thank-you screen ──────────────────────────────────────────────────────────

function ThankYouScreen({
  message,
  onReset,
  accent,
  accentFg,
}: {
  message: string | null;
  onReset: () => void;
  accent: string;
  accentFg: string;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 py-20 text-center">
      {/* Animated checkmark */}
      <div
        className="mb-8 flex h-20 w-20 items-center justify-center rounded-full"
        style={{ backgroundColor: `${accent}20` }}
      >
        <svg
          viewBox="0 0 52 52"
          className="h-10 w-10"
          style={{ stroke: accent }}
          fill="none"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="26" cy="26" r="22" className="animate-[dash-circle_0.6s_ease-out_forwards]" />
          <path
            d="M14 26l8 8 16-16"
            className="animate-[dash-check_0.4s_0.5s_ease-out_forwards]"
            strokeDasharray="28"
            strokeDashoffset="28"
            style={{ animation: "dash-check 0.4s 0.5s ease-out forwards" }}
          />
        </svg>
      </div>

      <h1 className="text-3xl font-semibold">Thank you!</h1>
      <p className="mt-3 max-w-sm text-base opacity-70 leading-relaxed">
        {message ?? "Your response has been recorded. We appreciate your time."}
      </p>

      <div className="mt-8 flex flex-col items-center gap-3">
        <button
          onClick={onReset}
          className="inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-medium transition-opacity hover:opacity-80"
          style={{ backgroundColor: accent, color: accentFg }}
        >
          <RotateCcw className="h-4 w-4" />
          Submit another response
        </button>

        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm opacity-50 transition-opacity hover:opacity-80"
        >
          Want to build forms like this?
          <ExternalLink className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

interface PublicFormPageProps {
  form: PublicForm;
  fields: PublicField[];
  slug: string;
  password?: string;
  theme?: ThemeTokens | null;
}

export function PublicFormPage({ form, fields, slug, password, theme }: PublicFormPageProps) {
  const [values, setValues] = useState<Record<string, unknown>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [submittedMessage, setSubmittedMessage] = useState<string | null>(null);
  const honeypotRef = useRef<HTMLInputElement>(null);
  const firstErrorRef = useRef<string | null>(null);

  const accent = theme?.accent ?? "#0f0e0b";
  const accentFg = theme?.accentForeground ?? "#f4c95d";
  const bg = theme?.background ?? "#f5f2ec";
  const fg = theme?.foreground ?? "#1a1812";
  const muted = theme?.muted ?? "#7a7060";

  const submit = trpc.responses.submit.useMutation({
    onSuccess: (data) => {
      setSubmittedMessage(data.thankYouMessage);
      setSubmitted(true);
    },
    onError: (err) => {
      if (err.data?.code === "TOO_MANY_REQUESTS") {
        toast.error("You're submitting too quickly. Please wait a moment and try again.");
      } else if (err.data?.code === "UNPROCESSABLE_CONTENT") {
        toast.error("Some answers are invalid. Please review and try again.");
      } else {
        toast.error(err.message ?? "Submission failed. Please try again.");
      }
    },
  });

  const builderFields = fields.map(toBuilderField);

  function handleChange(id: string, value: unknown) {
    setValues((prev) => ({ ...prev, [id]: value }));
    if (errors[id]) setErrors((prev) => ({ ...prev, [id]: "" }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    // Honeypot check (client-side)
    const honeypot = honeypotRef.current?.value ?? "";

    const prepared = prepareAnswers(values, fields);

    // Client-side validation with buildResponseSchema
    const newErrors: Record<string, string> = {};
    try {
      const schema = buildResponseSchema(builderFields as unknown as FormField[]);
      const result = schema.safeParse(prepared);
      if (!result.success) {
        for (const issue of result.error.issues) {
          const id = issue.path[0] as string;
          if (id && !newErrors[id]) newErrors[id] = issue.message;
        }
      }
    } catch {
      // Fallback: manual required check
      for (const field of fields) {
        if (field.required) {
          const v = prepared[field.id];
          if (
            v === undefined ||
            v === null ||
            v === "" ||
            (Array.isArray(v) && v.length === 0)
          ) {
            newErrors[field.id] = "This field is required";
          }
        }
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      // Scroll to first error
      const firstId = fields.find((f) => newErrors[f.id])?.id;
      if (firstId) {
        document.getElementById(`field-${firstId}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      return;
    }

    submit.mutate({
      formSlug: slug,
      answers: prepared,
      website: honeypot || undefined,
      password: password || undefined,
    });
  }

  function handleReset() {
    setValues({});
    setErrors({});
    setSubmitted(false);
    setSubmittedMessage(null);
  }

  if (submitted) {
    return (
      <div style={{ background: bg, color: fg, minHeight: "100vh" }}>
        <ThankYouScreen
          message={submittedMessage ?? form.thankYouMessage}
          onReset={handleReset}
          accent={accent}
          accentFg={accentFg}
        />
        <footer className="pb-6 text-center">
          <Link
            href="/"
            className="text-xs transition-opacity hover:opacity-80"
            style={{ color: muted }}
          >
            Powered by MysticForm
          </Link>
        </footer>
      </div>
    );
  }

  return (
    <div style={{ background: bg, color: fg, minHeight: "100vh" }}>
      <div className="mx-auto max-w-[640px] px-6 pb-20 pt-16 sm:px-8">
        {/* Cover header */}
        <header className="mb-12">
          {form.coverEmoji && (
            <div className="mb-5 text-5xl leading-none">{form.coverEmoji}</div>
          )}
          <h1 className="text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
            {form.title}
          </h1>
          {form.description && (
            <p className="mt-3 text-base leading-relaxed" style={{ color: muted }}>
              {form.description}
            </p>
          )}
        </header>

        {/* Form */}
        <form onSubmit={handleSubmit} noValidate className="space-y-10">
          {/* Honeypot — hidden from humans, catches bots */}
          <input
            ref={honeypotRef}
            name="website"
            type="text"
            autoComplete="off"
            tabIndex={-1}
            aria-hidden="true"
            style={{ position: "absolute", left: "-9999px", width: "1px", height: "1px" }}
          />

          {fields.length === 0 && (
            <p className="py-12 text-center text-sm" style={{ color: muted }}>
              This form has no questions yet.
            </p>
          )}

          {builderFields.map((field) => (
            <div key={field.id} id={`field-${field.id}`}>
              <ThemedFieldRenderer
                field={field}
                value={values[field.id]}
                onChange={(v) => handleChange(field.id, v)}
                error={errors[field.id]}
                accent={accent}
              />
            </div>
          ))}

          {fields.length > 0 && (
            <div className="pt-2">
              <button
                type="submit"
                disabled={submit.isPending}
                className="inline-flex min-w-36 items-center justify-center gap-2 rounded-xl px-8 py-3 text-sm font-semibold transition-opacity disabled:opacity-60 hover:opacity-90"
                style={{ backgroundColor: accent, color: accentFg }}
              >
                {submit.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  form.submitLabel ?? "Submit"
                )}
              </button>
            </div>
          )}
        </form>

        {/* Footer */}
        <footer className="mt-16 text-center">
          <Link
            href="/"
            className="text-xs transition-opacity hover:opacity-80"
            style={{ color: muted }}
          >
            Powered by MysticForm
          </Link>
        </footer>
      </div>
    </div>
  );
}

// ── Themed field renderer wrapper ─────────────────────────────────────────────
// Overrides FieldRenderer's hardcoded colours with theme tokens where possible.

function ThemedFieldRenderer({
  field,
  value,
  onChange,
  error,
  accent,
}: {
  field: BuilderField;
  value: unknown;
  onChange: (v: unknown) => void;
  error?: string;
  accent: string;
}) {
  return (
    <div
      style={
        {
          "--field-accent": accent,
          "--field-ring": `${accent}40`,
        } as React.CSSProperties
      }
    >
      <FieldRenderer field={field} value={value} onChange={onChange} error={error} />
    </div>
  );
}
