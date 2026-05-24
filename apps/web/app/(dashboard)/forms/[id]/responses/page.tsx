"use client";

import { useMemo, useState } from "react";
import { Download, Loader2, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { getQueryKey } from "@trpc/react-query";
import { useQueryClient } from "@tanstack/react-query";
import { trpc } from "~/trpc/client";
import { useFormShell } from "~/components/dashboard/form-shell-context";
import { Button } from "~/components/ui/button";
import { Checkbox } from "~/components/ui/checkbox";
import { Input } from "~/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "~/components/ui/sheet";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import type { RouterOutputs } from "@repo/trpc/client";

type ResponseItem = RouterOutputs["responses"]["list"]["items"][number];

function formatValue(value: unknown) {
  if (value === null || value === undefined || value === "") return "—";
  if (Array.isArray(value)) return value.join(", ");
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (value instanceof Date) return format(value, "PPp");
  return String(value);
}

function downloadCsv(filename: string, csv: string) {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export default function FormResponsesPage() {
  const { form, fields } = useFormShell();
  const queryClient = useQueryClient();
  const utils = trpc.useUtils();
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [openResponse, setOpenResponse] = useState<ResponseItem | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  const query = trpc.responses.list.useInfiniteQuery(
    { formId: form.id, limit: 25, search: search.trim() || undefined },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
      staleTime: 15_000,
    },
  );

  const responses = useMemo(
    () => query.data?.pages.flatMap((page) => page.items) ?? [],
    [query.data],
  );
  const previewFields = fields.slice(0, 3);

  async function handleExportCsv() {
    setIsExporting(true);
    try {
      const { filename, csv } = await utils.responses.exportCsv.fetch({ formId: form.id });
      downloadCsv(filename, csv);
      toast.success("CSV exported");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to export CSV");
    } finally {
      setIsExporting(false);
    }
  }

  const bulkDelete = trpc.responses.bulkDelete.useMutation({
    onSuccess: ({ deletedCount }) => {
      toast.success(`${deletedCount} ${deletedCount === 1 ? "response" : "responses"} deleted`);
      setSelected(new Set());
      queryClient.invalidateQueries({ queryKey: getQueryKey(trpc.responses.list) });
      queryClient.invalidateQueries({ queryKey: getQueryKey(trpc.analytics.summary) });
      queryClient.invalidateQueries({ queryKey: getQueryKey(trpc.analytics.fieldBreakdown) });
    },
    onError: (err) => toast.error(err.message ?? "Failed to delete responses"),
  });

  function toggleSelected(id: string) {
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleAllVisible() {
    setSelected((current) => {
      const visibleIds = responses.map((response) => response.id);
      const allSelected = visibleIds.every((id) => current.has(id));
      const next = new Set(current);
      for (const id of visibleIds) {
        if (allSelected) next.delete(id);
        else next.add(id);
      }
      return next;
    });
  }

  return (
    <div className="min-h-full bg-[#f5f2ec] px-6 py-8 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-[#1a1812]">Responses</h1>
            <p className="mt-1 text-sm text-[#7a7060]">
              Review submissions for {form.title}.
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button
              variant="outline"
              onClick={handleExportCsv}
              disabled={isExporting}
              className="gap-2 border-[#e0d8cc] bg-white text-[#3a3428] hover:bg-[#f5f0e8]"
            >
              {isExporting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Download className="h-4 w-4" />
              )}
              Export CSV
            </Button>
            <Button
              variant="outline"
              disabled={selected.size === 0 || bulkDelete.isPending}
              onClick={() => {
                if (confirm(`Delete ${selected.size} selected responses?`)) {
                  bulkDelete.mutate({ ids: Array.from(selected) });
                }
              }}
              className="gap-2 border-red-200 bg-white text-red-600 hover:bg-red-50 disabled:opacity-50"
            >
              {bulkDelete.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4" />
              )}
              Delete selected
            </Button>
          </div>
        </div>

        <div className="mb-4 flex flex-col gap-3 rounded-2xl border border-[#e8e0d4] bg-[#faf9f6] p-4 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9a9080]" />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search answers or respondent email"
              className="border-[#e0d8cc] bg-white pl-9 text-[#2a2520] placeholder:text-[#b8aea0]"
            />
          </div>
          <p className="text-sm text-[#7a7060]">
            {responses.length} loaded {responses.length === 1 ? "response" : "responses"}
          </p>
        </div>

        <div className="overflow-hidden rounded-2xl border border-[#e8e0d4] bg-[#faf9f6]">
          {query.isLoading ? (
            <div className="flex items-center justify-center gap-2 py-20 text-sm text-[#7a7060]">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading responses
            </div>
          ) : responses.length === 0 ? (
            <div className="px-6 py-20 text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#f0ebe0] text-2xl">
                📨
              </div>
              <h2 className="text-base font-semibold text-[#1a1812]">No responses yet</h2>
              <p className="mt-1 text-sm text-[#7a7060]">
                Share your public form link to start collecting submissions.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-[#e8e0d4] hover:bg-transparent">
                  <TableHead className="w-10 px-4">
                    <Checkbox
                      checked={responses.every((response) => selected.has(response.id))}
                      onCheckedChange={toggleAllVisible}
                      aria-label="Select all visible responses"
                    />
                  </TableHead>
                  <TableHead className="text-[#5f5a4e]">Submitted</TableHead>
                  <TableHead className="text-[#5f5a4e]">Respondent</TableHead>
                  {previewFields.map((field) => (
                    <TableHead key={field.id} className="text-[#5f5a4e]">
                      {field.label}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {responses.map((response) => (
                  <TableRow
                    key={response.id}
                    className="cursor-pointer border-[#eee6dc] hover:bg-[#f5f0e8]"
                    onClick={() => setOpenResponse(response)}
                  >
                    <TableCell className="px-4" onClick={(event) => event.stopPropagation()}>
                      <Checkbox
                        checked={selected.has(response.id)}
                        onCheckedChange={() => toggleSelected(response.id)}
                        aria-label="Select response"
                      />
                    </TableCell>
                    <TableCell className="text-[#3a3428]">
                      {response.createdAt ? format(new Date(response.createdAt), "PPp") : "—"}
                    </TableCell>
                    <TableCell className="text-[#3a3428]">
                      {response.respondentEmail ?? "Anonymous"}
                    </TableCell>
                    {previewFields.map((field) => (
                      <TableCell key={field.id} className="max-w-[220px] truncate text-[#3a3428]">
                        {formatValue(response.answers[field.id])}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>

        {query.hasNextPage && (
          <div className="mt-4 flex justify-center">
            <Button
              variant="outline"
              onClick={() => query.fetchNextPage()}
              disabled={query.isFetchingNextPage}
              className="border-[#e0d8cc] bg-white text-[#3a3428] hover:bg-[#f5f0e8]"
            >
              {query.isFetchingNextPage ? "Loading..." : "Load more"}
            </Button>
          </div>
        )}
      </div>

      <Sheet open={!!openResponse} onOpenChange={(open) => !open && setOpenResponse(null)}>
        <SheetContent className="w-full border-[#e8e0d4] bg-[#faf9f6] sm:max-w-xl">
          <SheetHeader className="border-b border-[#e8e0d4] px-6 py-5">
            <SheetTitle className="text-[#1a1812]">Response details</SheetTitle>
          </SheetHeader>
          {openResponse && (
            <div className="flex-1 overflow-y-auto px-6 py-5">
              <div className="mb-6 rounded-xl border border-[#e8e0d4] bg-white p-4 text-sm text-[#5f5a4e]">
                <p>
                  Submitted{" "}
                  <span className="font-medium text-[#1a1812]">
                    {openResponse.createdAt
                      ? format(new Date(openResponse.createdAt), "PPp")
                      : "—"}
                  </span>
                </p>
                <p className="mt-1">
                  Respondent{" "}
                  <span className="font-medium text-[#1a1812]">
                    {openResponse.respondentEmail ?? "Anonymous"}
                  </span>
                </p>
              </div>
              <div className="space-y-3">
                {fields.map((field) => (
                  <div key={field.id} className="rounded-xl border border-[#e8e0d4] bg-white p-4">
                    <p className="text-xs font-semibold uppercase tracking-widest text-[#9a9080]">
                      {field.label}
                    </p>
                    <p className="mt-2 whitespace-pre-wrap text-sm text-[#1a1812]">
                      {formatValue(openResponse.answers[field.id])}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
