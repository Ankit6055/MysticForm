"use client";

import Link from "next/link";
import { ArrowRight, Users, Loader2 } from "lucide-react";
import { cn } from "~/lib/utils";
import { trpc } from "~/trpc/client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

type ThemeTokens = {
  background: string;
  foreground: string;
  accent: string;
  accentForeground: string;
  muted: string;
  font: string;
  radius: string;
};

export type ExploreCard = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  coverEmoji: string | null;
  theme: { slug: string; tokens: ThemeTokens } | null;
  responseCount: number;
  creatorName: string;
};

// ── Open-form card (for /explore) ────────────────────────────────────────────

export function PublicFormCard({ item }: { item: ExploreCard }) {
  const accent = item.theme?.tokens.accent ?? "#0f0e0b";
  const accentFg = item.theme?.tokens.accentForeground ?? "#f4c95d";

  return (
    <Link
      href={`/f/${item.slug}`}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-[#e8e0d4] bg-[#faf9f6] transition-all duration-200 hover:-translate-y-0.5 hover:border-[#c8bfb0] hover:shadow-[0_8px_32px_0_rgba(26,24,18,0.10)]"
    >
      {/* Top section */}
      <div className="p-5 pb-4">
        {/* Emoji */}
        <div
          className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl text-2xl"
          style={{ backgroundColor: `${accent}15` }}
        >
          {item.coverEmoji ?? "📋"}
        </div>

        {/* Title */}
        <h3 className="mb-1.5 font-semibold leading-snug text-[#1a1812] line-clamp-1">
          {item.title}
        </h3>

        {/* Description */}
        {item.description && (
          <p className="text-sm leading-relaxed text-[#7a7060] line-clamp-2">
            {item.description}
          </p>
        )}
      </div>

      {/* Footer */}
      <div className="mt-auto border-t border-[#f0ebe0] px-5 py-3">
        <div className="flex items-center justify-between gap-2 text-xs text-[#9a9080]">
          <div className="flex items-center gap-2 min-w-0">
            {item.theme && (
              <span className="flex items-center gap-1.5 shrink-0">
                <span
                  className="inline-block h-2 w-2 rounded-full"
                  style={{ backgroundColor: accent }}
                />
                <span className="text-[#7a7060]">{item.theme.slug}</span>
              </span>
            )}
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <span className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              {item.responseCount}
            </span>
            <span className="truncate max-w-[80px]" title={item.creatorName}>
              {item.creatorName}
            </span>
          </div>
        </div>
      </div>

      {/* Hover overlay */}
      <div className="absolute inset-x-0 bottom-0 flex translate-y-full items-center justify-center gap-2 rounded-b-2xl py-3 text-sm font-medium transition-transform duration-200 group-hover:translate-y-0"
        style={{ backgroundColor: accent, color: accentFg }}
      >
        Open form
        <ArrowRight className="h-4 w-4" />
      </div>
    </Link>
  );
}

// ── Template card (for /templates) ───────────────────────────────────────────

export function TemplateCard({ item }: { item: ExploreCard }) {
  const router = useRouter();
  const accent = item.theme?.tokens.accent ?? "#0f0e0b";
  const accentFg = item.theme?.tokens.accentForeground ?? "#f4c95d";

  const clone = trpc.forms.clone.useMutation({
    onSuccess: (form) => {
      toast.success("Template cloned! Opening builder…");
      router.push(`/dashboard/forms/${form.id}/edit`);
    },
    onError: (err) => toast.error(err.message ?? "Failed to clone template"),
  });

  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-[#e8e0d4] bg-[#faf9f6] transition-all duration-200 hover:border-[#c8bfb0] hover:shadow-[0_4px_20px_0_rgba(26,24,18,0.07)]">
      {/* Top section */}
      <div className="p-5 pb-4">
        <div
          className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl text-2xl"
          style={{ backgroundColor: `${accent}15` }}
        >
          {item.coverEmoji ?? "📋"}
        </div>
        <h3 className="mb-1.5 font-semibold leading-snug text-[#1a1812] line-clamp-1">
          {item.title}
        </h3>
        {item.description && (
          <p className="text-sm leading-relaxed text-[#7a7060] line-clamp-2">
            {item.description}
          </p>
        )}
      </div>

      {/* Footer with CTA */}
      <div className="mt-auto border-t border-[#f0ebe0] px-5 py-4">
        <div className="mb-3 flex items-center gap-2 text-xs text-[#9a9080]">
          {item.theme && (
            <span className="flex items-center gap-1.5">
              <span
                className="inline-block h-2 w-2 rounded-full"
                style={{ backgroundColor: accent }}
              />
              {item.theme.slug}
            </span>
          )}
          <span className="ml-auto flex items-center gap-1">
            <Users className="h-3 w-3" />
            {item.responseCount} responses
          </span>
        </div>
        <button
          onClick={() => clone.mutate({ id: item.id })}
          disabled={clone.isPending}
          className={cn(
            "flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold transition-opacity disabled:opacity-60 hover:opacity-90",
          )}
          style={{ backgroundColor: accent, color: accentFg }}
        >
          {clone.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            "Use this template"
          )}
        </button>
      </div>
    </div>
  );
}
