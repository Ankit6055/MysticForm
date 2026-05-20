import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { api } from "~/trpc/server";
import { FormShellProvider } from "~/components/dashboard/form-shell-context";
import { FormShellNav } from "~/components/dashboard/form-shell-nav";
import { SharePopover } from "~/components/share-popover";

interface FormLayoutProps {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}

export default async function FormLayout({ children, params }: FormLayoutProps) {
  const { id } = await params;

  let result;
  try {
    result = await api.forms.get.query({ id });
  } catch {
    notFound();
  }

  const { form, fields } = result;
  const isDraft = form.visibility === "draft";

  return (
    <FormShellProvider form={form} fields={fields}>
      <div className="flex h-full flex-col">
        {/* Shell header */}
        <header className="flex items-center gap-4 border-b border-[#e8e0d4] bg-[#faf9f6] px-6 py-4">
          <Link
            href="/dashboard"
            className="shrink-0 text-[#7a7060] transition-colors hover:text-[#1a1812]"
          >
            <ChevronLeft className="h-4 w-4" />
          </Link>

          <div className="flex min-w-0 flex-1 items-center gap-3">
            <span className="text-xl leading-none" aria-hidden>
              {form.coverEmoji ?? "📋"}
            </span>
            <h1 className="truncate text-sm font-semibold text-[#1a1812]">{form.title}</h1>
            <span
              className={[
                "inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium",
                form.visibility === "draft"
                  ? "border-stone-200 bg-stone-100 text-stone-600"
                  : form.visibility === "unlisted"
                    ? "border-amber-200 bg-amber-50 text-amber-700"
                    : "border-emerald-200 bg-emerald-50 text-emerald-700",
              ].join(" ")}
            >
              {form.visibility.charAt(0).toUpperCase() + form.visibility.slice(1)}
            </span>
          </div>

          <SharePopover slug={form.slug} disabled={isDraft} />
        </header>

        {/* Secondary nav */}
        <FormShellNav formId={id} />

        {/* Page content */}
        <main className="flex-1 overflow-y-auto bg-[#f5f2ec]">{children}</main>
      </div>
    </FormShellProvider>
  );
}
