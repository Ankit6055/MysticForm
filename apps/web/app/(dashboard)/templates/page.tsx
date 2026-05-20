import { Suspense } from "react";
import { LayoutTemplate } from "lucide-react";
import { api } from "~/trpc/server";
import { TemplateCard } from "~/components/explore/public-form-card";

async function TemplateGrid() {
  const items = await api.explore.featured.query({ limit: 50 }).catch(() => []);

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#f0ebe0]">
          <LayoutTemplate className="h-6 w-6 text-[#9a9080]" />
        </div>
        <h3 className="text-base font-semibold text-[#1a1812]">No templates yet</h3>
        <p className="mt-1 text-sm text-[#7a7060]">
          Seeded templates will appear here once the database is populated.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => (
        <TemplateCard key={item.id} item={item} />
      ))}
    </div>
  );
}

export default function TemplatesPage() {
  return (
    <div className="min-h-full bg-[#f5f2ec] px-6 py-8 lg:px-8">
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <div className="mb-8">
          <div className="mb-2 flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#0f0e0b]">
              <LayoutTemplate className="h-4 w-4 text-[#f4c95d]" />
            </div>
            <h1 className="text-xl font-semibold tracking-tight text-[#1a1812]">Templates</h1>
          </div>
          <p className="text-sm text-[#7a7060]">
            Pick a starter template and clone it into your account to get building faster.
          </p>
        </div>

        <Suspense
          fallback={
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="h-56 animate-pulse rounded-2xl border border-[#e8e0d4] bg-[#faf9f6]"
                  style={{ animationDelay: `${i * 60}ms` }}
                />
              ))}
            </div>
          }
        >
          <TemplateGrid />
        </Suspense>
      </div>
    </div>
  );
}
