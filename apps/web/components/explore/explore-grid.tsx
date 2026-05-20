"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, X, Loader2, FileQuestion } from "lucide-react";
import { trpc } from "~/trpc/client";
import { cn } from "~/lib/utils";
import { PublicFormCard, type ExploreCard } from "./public-form-card";

type Theme = {
  id: string;
  slug: string;
  name: string;
  tokens: { accent: string };
};

interface ExploreGridProps {
  initialItems: ExploreCard[];
  themes: Theme[];
  initialQ: string;
  initialTheme: string;
}

function EmptyState({ q, theme }: { q: string; theme: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#f0ebe0]">
        <FileQuestion className="h-6 w-6 text-[#9a9080]" />
      </div>
      <h3 className="text-base font-semibold text-[#1a1812]">No forms found</h3>
      <p className="mt-1 text-sm text-[#7a7060]">
        {q
          ? `No public forms matching "${q}"`
          : theme
            ? `No forms using the "${theme}" theme yet`
            : "No forms to show"}
      </p>
    </div>
  );
}

export function ExploreGrid({
  initialItems,
  themes,
  initialQ,
  initialTheme,
}: ExploreGridProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [q, setQ] = useState(initialQ);
  const [activeTheme, setActiveTheme] = useState(initialTheme);
  const [items, setItems] = useState<ExploreCard[]>(initialItems);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const utils = trpc.useUtils();

  // Update URL without triggering navigation
  function updateUrl(newQ: string, newTheme: string) {
    const params = new URLSearchParams();
    if (newQ) params.set("q", newQ);
    if (newTheme) params.set("theme", newTheme);
    const qs = params.toString();
    router.replace(qs ? `?${qs}` : "/explore", { scroll: false });
  }

  // Fetch on search / theme change
  const fetchResults = useCallback(
    async (query: string, theme: string) => {
      if (!query && !theme) {
        setItems(initialItems);
        setNextCursor(null);
        return;
      }
      setIsLoading(true);
      try {
        if (query) {
          const result = await utils.explore.search.fetch({ q: query, limit: 12 });
          setItems(result.items);
          setNextCursor(result.nextCursor);
        } else if (theme) {
          const result = await utils.explore.byTheme.fetch({
            themeSlug: theme,
            limit: 12,
          });
          setItems(result.items);
          setNextCursor(result.nextCursor);
        }
      } catch {
        setItems([]);
        setNextCursor(null);
      } finally {
        setIsLoading(false);
      }
    },
    [utils, initialItems],
  );

  // Debounce search; instant for theme
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchResults(q, activeTheme);
    }, q ? 300 : 0);
    return () => clearTimeout(timer);
  }, [q, activeTheme, fetchResults]);

  function handleSearchChange(value: string) {
    setQ(value);
    updateUrl(value, activeTheme);
  }

  function handleThemeToggle(slug: string) {
    const next = activeTheme === slug ? "" : slug;
    setActiveTheme(next);
    updateUrl(q, next);
  }

  function clearAll() {
    setQ("");
    setActiveTheme("");
    updateUrl("", "");
  }

  async function loadMore() {
    if (!nextCursor || isLoadingMore) return;
    setIsLoadingMore(true);
    try {
      let result: { items: ExploreCard[]; nextCursor: string | null };
      if (q) {
        result = await utils.explore.search.fetch({ q, limit: 12, cursor: nextCursor });
      } else {
        result = await utils.explore.byTheme.fetch({
          themeSlug: activeTheme,
          limit: 12,
          cursor: nextCursor,
        });
      }
      setItems((prev) => [...prev, ...result.items]);
      setNextCursor(result.nextCursor);
    } finally {
      setIsLoadingMore(false);
    }
  }

  const hasFilter = !!q || !!activeTheme;

  return (
    <div>
      {/* Search + filter bar */}
      <div className="mb-8 space-y-4">
        {/* Search input */}
        <div className="relative max-w-sm">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9a9080]" />
          <input
            type="search"
            value={q}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Search forms…"
            className="h-10 w-full rounded-xl border border-[#e0d8cc] bg-white pl-10 pr-4 text-sm text-[#1a1812] outline-none transition-colors placeholder:text-[#b8aea0] focus:border-[#c9a83c] focus:ring-2 focus:ring-[#f4c95d]/20"
          />
        </div>

        {/* Theme chips */}
        {themes.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {themes.map((theme) => {
              const isActive = activeTheme === theme.slug;
              return (
                <button
                  key={theme.slug}
                  onClick={() => handleThemeToggle(theme.slug)}
                  className={cn(
                    "flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-all",
                    isActive
                      ? "border-transparent text-white shadow-sm"
                      : "border-[#e8e0d4] bg-white text-[#5f5a4e] hover:border-[#c8bfb0]",
                  )}
                  style={
                    isActive
                      ? { backgroundColor: theme.tokens.accent }
                      : {}
                  }
                >
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: isActive ? "white" : theme.tokens.accent, opacity: isActive ? 0.7 : 1 }}
                  />
                  {theme.name}
                </button>
              );
            })}

            {hasFilter && (
              <button
                onClick={clearAll}
                className="flex items-center gap-1 rounded-full border border-[#e8e0d4] bg-white px-3 py-1 text-xs text-[#9a9080] transition-colors hover:border-[#c8bfb0] hover:text-[#1a1812]"
              >
                <X className="h-3 w-3" />
                Clear
              </button>
            )}
          </div>
        )}
      </div>

      {/* Results */}
      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-52 animate-pulse rounded-2xl border border-[#e8e0d4] bg-[#faf9f6]"
              style={{ animationDelay: `${i * 60}ms` }}
            />
          ))}
        </div>
      ) : items.length === 0 ? (
        <EmptyState q={q} theme={activeTheme} />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((item) => (
              <PublicFormCard key={item.id} item={item} />
            ))}
          </div>

          {/* Load more */}
          {nextCursor && (
            <div className="mt-10 flex justify-center">
              <button
                onClick={loadMore}
                disabled={isLoadingMore}
                className="flex items-center gap-2 rounded-xl border border-[#e0d8cc] bg-white px-6 py-2.5 text-sm font-medium text-[#3a3428] transition-colors hover:border-[#c8bfb0] hover:bg-[#f5f0e8] disabled:opacity-60"
              >
                {isLoadingMore ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Load more"
                )}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
