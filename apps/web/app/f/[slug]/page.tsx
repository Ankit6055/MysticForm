import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { Clock, AlertCircle, Sparkles } from "lucide-react";
import { api } from "~/trpc/server";
import { PublicFormPage } from "./public-form-page";
import { PasswordPrompt } from "./password-prompt";

interface PageProps {
  params: Promise<{ slug: string }>;
}

// ── Error screens (server-rendered) ──────────────────────────────────────────

function FormNotAvailable() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#f5f2ec] px-6 text-center">
      <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#f0ebe0]">
        <AlertCircle className="h-7 w-7 text-[#7a7060]" />
      </div>
      <h1 className="text-2xl font-semibold text-[#1a1812]">Form not available</h1>
      <p className="mt-3 max-w-xs text-sm leading-relaxed text-[#7a7060]">
        This form doesn&apos;t exist or has been removed by its creator.
      </p>
      <div className="mt-8 flex flex-col items-center gap-3">
        <Link
          href="/explore"
          className="rounded-xl bg-[#0f0e0b] px-6 py-2.5 text-sm font-semibold text-[#f4c95d] transition-opacity hover:opacity-90"
        >
          Explore other forms
        </Link>
        <Link href="/" className="text-sm text-[#9a9080] underline underline-offset-2 hover:text-[#1a1812]">
          ← Back to MysticForm
        </Link>
      </div>
    </div>
  );
}

function FormClosed() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#f5f2ec] px-6 text-center">
      <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#f0ebe0]">
        <Clock className="h-7 w-7 text-[#7a7060]" />
      </div>
      <h1 className="text-2xl font-semibold text-[#1a1812]">
        No longer accepting responses
      </h1>
      <p className="mt-3 max-w-xs text-sm leading-relaxed text-[#7a7060]">
        This form has reached its response limit or has expired.
      </p>
      <div className="mt-8 flex flex-col items-center gap-3">
        <Link
          href="/explore"
          className="rounded-xl bg-[#0f0e0b] px-6 py-2.5 text-sm font-semibold text-[#f4c95d] transition-opacity hover:opacity-90"
        >
          Explore other forms
        </Link>
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-[#9a9080] transition-opacity hover:opacity-70"
        >
          <Sparkles className="h-3.5 w-3.5" />
          Build your own form with MysticForm
        </Link>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  try {
    const { form } = await api.forms.getPublic.query({ slug });
    return {
      title: form.title,
      description: form.description ?? `Fill out ${form.title} on MysticForm`,
    };
  } catch {
    return { title: "Form | MysticForm" };
  }
}

export default async function PublicFormRoute({ params }: PageProps) {
  const { slug } = await params;

  // ── Try fetching the form ─────────────────────────────────────
  let result: Awaited<ReturnType<typeof api.forms.getPublic.query>> | null = null;
  let errorState: "not_found" | "password_required" | "closed" | null = null;

  try {
    result = await api.forms.getPublic.query({ slug });
  } catch (e: unknown) {
    const code = (e as { data?: { code?: string } })?.data?.code;
    switch (code) {
      case "NOT_FOUND":
        errorState = "not_found";
        break;
      case "FORBIDDEN":
        // Could be wrong password or password required
        errorState = "password_required";
        break;
      case "PRECONDITION_FAILED":
      case "GONE":
        errorState = "closed";
        break;
      default:
        // For any other error (expired, limit reached, etc.)
        errorState = result === null ? "not_found" : "closed";
    }
  }

  // ── Branch on state ───────────────────────────────────────────

  if (errorState === "not_found") {
    notFound();
  }

  if (errorState === "closed") {
    return <FormClosed />;
  }

  if (errorState === "password_required") {
    return <PasswordPrompt slug={slug} />;
  }

  if (!result) {
    notFound();
  }

  const { form, fields } = result;

  // ── Fetch theme if set ────────────────────────────────────────
  let theme = null;
  if (form.themeId) {
    try {
      const themeData = await api.themes.list.query();
      const found = themeData.find((t) => t.id === form.themeId);
      if (found) theme = found.tokens;
    } catch {
      // Theme load failure is non-fatal
    }
  }

  return (
    <PublicFormPage
      form={form}
      fields={fields}
      slug={slug}
      theme={theme}
    />
  );
}
