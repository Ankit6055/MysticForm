import { Suspense } from "react";
import { Sparkles } from "lucide-react";
import type { Metadata } from "next";
import { api } from "~/trpc/server";
import { ExploreGrid } from "~/components/explore/explore-grid";
import { SiteNav } from "~/components/site-nav";
import { SiteFooter } from "~/components/site-footer";

export const metadata: Metadata = {
  title: "Explore forms — MysticForm",
  description: "Discover public forms built by the MysticForm community.",
};

interface PageProps {
  searchParams: Promise<{ q?: string; theme?: string }>;
}

export default async function ExplorePage({ searchParams }: PageProps) {
  const { q = "", theme = "" } = await searchParams;

  // Server-fetch initial data in parallel
  const [initialItems, themes] = await Promise.all([
    api.explore.featured.query({ limit: 12 }).catch(() => []),
    api.themes.list.query().catch(() => []),
  ]);

  return (
    <>
      <SiteNav />

      {/* Hero */}
      <section className="relative overflow-hidden bg-[#1a1812]">
        {/* Dot grid */}
        <svg
          className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.06]"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <pattern
              id="explore-dots"
              x="0"
              y="0"
              width="24"
              height="24"
              patternUnits="userSpaceOnUse"
            >
              <circle cx="1.5" cy="1.5" r="1.5" fill="#f4c95d" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#explore-dots)" />
        </svg>

        {/* Warm glow */}
        <div className="pointer-events-none absolute -right-40 -top-40 h-96 w-96 rounded-full bg-[#f4c95d]/8 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 left-1/4 h-72 w-72 rounded-full bg-[#1f7a63]/10 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
          <div className="max-w-2xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#f4c95d]/20 bg-[#f4c95d]/10 px-3 py-1 text-xs font-medium text-[#f4c95d]">
              <Sparkles className="h-3 w-3" />
              Community forms
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
              Explore forms
            </h1>
            <p className="mt-4 text-base leading-relaxed text-[#8a8070]">
              Discover public forms created by the MysticForm community. Filter by theme, search by
              topic, or get inspired by what others have built.
            </p>
          </div>
        </div>
      </section>

      {/* Grid */}
      <div className="min-h-screen bg-[#f5f2ec]">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <Suspense>
            <ExploreGrid
              initialItems={initialItems}
              themes={themes.map((t) => ({
                id: t.id,
                slug: t.slug,
                name: t.name,
                tokens: { accent: t.tokens.accent },
              }))}
              initialQ={q}
              initialTheme={theme}
            />
          </Suspense>
        </div>
      </div>

      <SiteFooter />
    </>
  );
}
