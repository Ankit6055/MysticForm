"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import {
  MoreHorizontal,
  Pencil,
  MessageSquare,
  Link2,
  Copy,
  Archive,
  ArchiveRestore,
  Trash2,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "~/lib/utils";
import { trpc } from "~/trpc/client";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import type { RouterOutputs } from "@repo/trpc/client";
import { getQueryKey } from "@trpc/react-query";
import { useQueryClient } from "@tanstack/react-query";

type FormListItem = RouterOutputs["forms"]["list"][number];

const visibilityConfig = {
  draft: {
    label: "Draft",
    className: "bg-stone-100 text-stone-600 border-stone-200",
  },
  unlisted: {
    label: "Unlisted",
    className: "bg-amber-50 text-amber-700 border-amber-200",
  },
  public: {
    label: "Public",
    className: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
};

interface FormCardProps {
  item: FormListItem;
}

export function FormCard({ item }: FormCardProps) {
  const { form, responseCount } = item;
  const router = useRouter();
  const queryClient = useQueryClient();

  function invalidateList() {
    queryClient.invalidateQueries({ queryKey: getQueryKey(trpc.forms.list) });
  }

  const archive = trpc.forms.archive.useMutation({
    onSuccess: () => {
      toast.success("Form archived");
      invalidateList();
    },
    onError: () => toast.error("Failed to archive form"),
  });

  const unarchive = trpc.forms.unarchive.useMutation({
    onSuccess: () => {
      toast.success("Form restored");
      invalidateList();
    },
    onError: () => toast.error("Failed to restore form"),
  });

  const clone = trpc.forms.clone.useMutation({
    onSuccess: () => {
      toast.success("Form cloned");
      invalidateList();
    },
    onError: () => toast.error("Failed to clone form"),
  });

  const del = trpc.forms.delete.useMutation({
    onSuccess: () => {
      toast.success("Form deleted");
      invalidateList();
    },
    onError: () => toast.error("Failed to delete form"),
  });

  function copyPublicLink() {
    const url = `${window.location.origin}/f/${form.slug}`;
    navigator.clipboard.writeText(url);
    toast.success("Link copied to clipboard");
  }

  const vis = visibilityConfig[form.visibility];
  const emoji = form.coverEmoji ?? "📋";
  const isArchived = form.status === "archived";

  const updatedAgo = form.updatedAt
    ? formatDistanceToNow(new Date(form.updatedAt), { addSuffix: true })
    : null;

  return (
    <article
      className={cn(
        "group relative flex flex-col rounded-2xl border bg-[#faf9f6] p-5 transition-all duration-200",
        "border-[#e8e0d4] hover:border-[#c8bfb0] hover:shadow-[0_4px_24px_0_rgba(26,24,18,0.08)] hover:-translate-y-0.5",
      )}
    >
      {/* Top row: emoji + visibility badge */}
      <div className="mb-4 flex items-start justify-between">
        <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-[#f0ebe0] text-2xl shadow-sm">
          {emoji}
        </div>
        <span
          className={cn(
            "inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium",
            vis.className,
          )}
        >
          {vis.label}
        </span>
      </div>

      {/* Title */}
      <h3 className="mb-1 line-clamp-2 text-sm font-semibold leading-snug text-[#1a1812] flex-1">
        <Link
          href={`/forms/${form.id}/edit`}
          className="rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-[#f4c95d]/60"
        >
          <span className="absolute inset-0" aria-hidden="true" />
          {form.title}
        </Link>
      </h3>

      {/* Stats */}
      <div className="mt-3 flex items-center gap-3 text-xs text-[#9a9080]">
        <span className="inline-flex items-center gap-1">
          <Users className="h-3 w-3" />
          {responseCount} {responseCount === 1 ? "response" : "responses"}
        </span>
        {updatedAgo && (
          <>
            <span className="text-[#d8d0c4]">·</span>
            <span>Updated {updatedAgo}</span>
          </>
        )}
      </div>

      {/* Kebab menu — appears on hover */}
      <div className="absolute right-3 top-3 z-10 opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label={`Open actions for ${form.title}`}
              className="h-7 w-7 rounded-lg bg-white/80 text-[#7a7060] shadow-sm backdrop-blur-sm hover:bg-white hover:text-[#1a1812]"
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-48 rounded-xl border-[#e8e0d4] bg-[#faf9f6] shadow-xl"
          >
            <DropdownMenuItem
              className="gap-2 text-[#3a3428] focus:bg-[#ede8de] focus:text-[#1a1812] cursor-pointer"
              onSelect={() => router.push(`/forms/${form.id}/edit`)}
            >
              <Pencil className="h-3.5 w-3.5" />
              Open builder
            </DropdownMenuItem>
            <DropdownMenuItem
              className="gap-2 text-[#3a3428] focus:bg-[#ede8de] focus:text-[#1a1812] cursor-pointer"
              onSelect={() => router.push(`/forms/${form.id}/responses`)}
            >
              <MessageSquare className="h-3.5 w-3.5" />
              View responses
            </DropdownMenuItem>
            <DropdownMenuItem
              className={cn(
                "gap-2 focus:bg-[#ede8de] cursor-pointer",
                form.visibility === "draft"
                  ? "cursor-not-allowed text-[#b8aea0]"
                  : "text-[#3a3428] focus:text-[#1a1812]",
              )}
              disabled={form.visibility === "draft"}
              onSelect={copyPublicLink}
            >
              <Link2 className="h-3.5 w-3.5" />
              Copy public link
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-[#e8e0d4]" />
            <DropdownMenuItem
              className="gap-2 text-[#3a3428] focus:bg-[#ede8de] focus:text-[#1a1812] cursor-pointer"
              onSelect={() => clone.mutate({ id: form.id })}
            >
              <Copy className="h-3.5 w-3.5" />
              Clone
            </DropdownMenuItem>
            <DropdownMenuItem
              className="gap-2 text-[#3a3428] focus:bg-[#ede8de] focus:text-[#1a1812] cursor-pointer"
              onSelect={() =>
                isArchived ? unarchive.mutate({ id: form.id }) : archive.mutate({ id: form.id })
              }
            >
              {isArchived ? (
                <ArchiveRestore className="h-3.5 w-3.5" />
              ) : (
                <Archive className="h-3.5 w-3.5" />
              )}
              {isArchived ? "Restore" : "Archive"}
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-[#e8e0d4]" />
            <DropdownMenuItem
              className="gap-2 text-red-600 focus:bg-red-50 focus:text-red-700 cursor-pointer"
              onSelect={() => {
                if (confirm(`Delete "${form.title}"? This cannot be undone.`)) {
                  del.mutate({ id: form.id });
                }
              }}
            >
              <Trash2 className="h-3.5 w-3.5" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </article>
  );
}
