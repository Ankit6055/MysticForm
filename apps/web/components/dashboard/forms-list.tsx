"use client";

import { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import { trpc } from "~/trpc/client";
import { Input } from "~/components/ui/input";
import { NewFormDialog } from "~/components/dashboard/new-form-dialog";
import { FormCard } from "~/components/dashboard/form-card";
import { cn } from "~/lib/utils";

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      {/* Hand-crafted illustration */}
      <div className="relative mb-8">
        <svg
          width="120"
          height="100"
          viewBox="0 0 120 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="mx-auto"
        >
          {/* Document shadow */}
          <rect x="22" y="18" width="76" height="72" rx="8" fill="#e8e0d4" />
          {/* Document body */}
          <rect
            x="18"
            y="14"
            width="76"
            height="72"
            rx="8"
            fill="#faf9f6"
            stroke="#e0d8cc"
            strokeWidth="1.5"
          />
          {/* Lines */}
          <rect x="32" y="28" width="48" height="4" rx="2" fill="#e0d8cc" />
          <rect x="32" y="38" width="36" height="4" rx="2" fill="#ede8de" />
          <rect x="32" y="48" width="44" height="4" rx="2" fill="#ede8de" />
          <rect x="32" y="58" width="30" height="4" rx="2" fill="#ede8de" />
          {/* Sparkle top-right */}
          <path
            d="M96 8 L97.5 12 L102 13.5 L97.5 15 L96 19 L94.5 15 L90 13.5 L94.5 12 Z"
            fill="#f4c95d"
          />
          {/* Small sparkle */}
          <path
            d="M108 20 L108.8 22.4 L111.2 23.2 L108.8 24 L108 26.4 L107.2 24 L104.8 23.2 L107.2 22.4 Z"
            fill="#f4c95d"
            opacity="0.6"
          />
          {/* Plus circle bottom-right */}
          <circle cx="88" cy="78" r="14" fill="#0f0e0b" />
          <path
            d="M88 72 L88 84 M82 78 L94 78"
            stroke="#f4c95d"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      </div>

      <h3 className="text-lg font-semibold text-[#1a1812]">No forms yet</h3>
      <p className="mt-2 max-w-xs text-sm leading-relaxed text-[#7a7060]">
        Create your first form and start collecting responses in minutes.
      </p>
      <div className="mt-6">
        <NewFormDialog />
      </div>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="h-40 animate-pulse rounded-2xl border border-[#e8e0d4] bg-[#faf9f6]"
          style={{ animationDelay: `${i * 60}ms` }}
        />
      ))}
    </div>
  );
}

type StatusTab = "active" | "archived";

interface FormsListProps {
  user: { fullName: string };
}

export function FormsList({ user }: FormsListProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [, startTransition] = useTransition();

  const initialStatus = (searchParams.get("status") as StatusTab) ?? "active";
  const [status, setStatus] = useState<StatusTab>(initialStatus);
  const [search, setSearch] = useState(searchParams.get("q") ?? "");

  const { data, isLoading } = trpc.forms.list.useQuery(
    { status, search: search.trim() || undefined },
    { staleTime: 30_000 },
  );

  function switchTab(next: StatusTab) {
    setStatus(next);
    startTransition(() => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("status", next);
      router.replace(`?${params.toString()}`);
    });
  }

  const firstName = user.fullName.split(" ")[0];

  return (
    <div className="min-h-full p-6 lg:p-8">
      {/* Page header */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-[#1a1812]">
            Welcome back, {firstName}
          </h1>
          <p className="mt-1 text-sm text-[#7a7060]">
            {data ? `${data.length} ${status} ${data.length === 1 ? "form" : "forms"}` : " "}
          </p>
        </div>
        <NewFormDialog />
      </div>

      {/* Tabs + search */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center">
        {/* Tab switcher */}
        <div className="flex rounded-lg border border-[#e8e0d4] bg-[#f0ebe0] p-1 w-fit">
          {(["active", "archived"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => switchTab(tab)}
              className={cn(
                "rounded-md px-4 py-1.5 text-sm font-medium capitalize transition-all",
                status === tab
                  ? "bg-white text-[#1a1812] shadow-sm"
                  : "text-[#7a7060] hover:text-[#3a3428]",
              )}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative sm:ml-auto sm:w-64">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#9a9080]" />
          <Input
            placeholder="Search forms…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-9 border-[#e0d8cc] bg-white pl-9 text-[#2a2520] placeholder:text-[#b8aea0] focus-visible:border-[#c9a83c] focus-visible:ring-[#f4c95d]/30"
          />
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <LoadingSkeleton />
      ) : !data || data.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {data.map((item) => (
            <FormCard key={item.form.id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}
