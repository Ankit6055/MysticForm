import Link from "next/link";
import { MessageSquare, ArrowRight } from "lucide-react";
import { api } from "~/trpc/server";
import { Button } from "~/components/ui/button";

export default async function DashboardResponsesPage() {
  const forms = await api.forms.list.query({ status: "active" }).catch(() => []);
  const withResponses = forms.filter((item) => item.responseCount > 0);
  const items = withResponses.length > 0 ? withResponses : forms;

  return (
    <div className="min-h-full bg-[#f5f2ec] px-6 py-8 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#0f0e0b]">
                <MessageSquare className="h-4 w-4 text-[#f4c95d]" />
              </div>
              <h1 className="text-xl font-semibold tracking-tight text-[#1a1812]">Responses</h1>
            </div>
            <p className="text-sm text-[#7a7060]">
              Open a form to review submissions, export CSVs, and inspect analytics.
            </p>
          </div>
          <Button asChild className="bg-[#0f0e0b] text-[#f4c95d] hover:bg-[#2a2520]">
            <Link href="/dashboard">Back to forms</Link>
          </Button>
        </div>

        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-[#e8e0d4] bg-[#faf9f6] px-6 py-20 text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#f0ebe0]">
              <MessageSquare className="h-6 w-6 text-[#9a9080]" />
            </div>
            <h2 className="text-base font-semibold text-[#1a1812]">No forms yet</h2>
            <p className="mt-1 max-w-sm text-sm text-[#7a7060]">
              Create and publish a form, then submissions will show up here.
            </p>
          </div>
        ) : (
          <div className="grid gap-3">
            {items.map(({ form, responseCount }) => (
              <Link
                key={form.id}
                href={`/forms/${form.id}/responses`}
                className="group flex items-center justify-between gap-4 rounded-2xl border border-[#e8e0d4] bg-[#faf9f6] px-5 py-4 transition-all hover:border-[#c8bfb0] hover:bg-white"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-3">
                    <span className="text-xl" aria-hidden>
                      {form.coverEmoji ?? "📋"}
                    </span>
                    <h2 className="truncate text-sm font-semibold text-[#1a1812]">
                      {form.title}
                    </h2>
                  </div>
                  <p className="mt-1 text-sm text-[#7a7060]">
                    {responseCount} {responseCount === 1 ? "response" : "responses"}
                  </p>
                </div>
                <ArrowRight className="h-4 w-4 shrink-0 text-[#9a9080] transition-transform group-hover:translate-x-1 group-hover:text-[#1a1812]" />
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
