"use client";

import { BarChart3, CalendarDays, Loader2, Star, Users } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { format } from "date-fns";
import { trpc } from "~/trpc/client";
import { useFormShell } from "~/components/dashboard/form-shell-context";

function StatCard({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string | number;
  icon: React.ElementType;
}) {
  return (
    <div className="rounded-2xl border border-[#e8e0d4] bg-[#faf9f6] p-5">
      <div className="mb-4 flex h-9 w-9 items-center justify-center rounded-xl bg-[#f0ebe0]">
        <Icon className="h-4 w-4 text-[#7a7060]" />
      </div>
      <p className="text-2xl font-semibold tracking-tight text-[#1a1812]">{value}</p>
      <p className="mt-1 text-sm text-[#7a7060]">{label}</p>
    </div>
  );
}

export default function FormAnalyticsPage() {
  const { form } = useFormShell();
  const summary = trpc.analytics.summary.useQuery({ formId: form.id }, { staleTime: 30_000 });
  const breakdown = trpc.analytics.fieldBreakdown.useQuery(
    { formId: form.id },
    { staleTime: 30_000 },
  );

  if (summary.isLoading || breakdown.isLoading) {
    return (
      <div className="flex h-full items-center justify-center gap-2 py-24 text-sm text-[#7a7060]">
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading analytics
      </div>
    );
  }

  if (summary.error || breakdown.error || !summary.data || !breakdown.data) {
    return (
      <div className="flex h-full items-center justify-center py-24">
        <div className="text-center">
          <h2 className="text-base font-semibold text-[#1a1812]">Analytics unavailable</h2>
          <p className="mt-1 text-sm text-[#7a7060]">Refresh the page and try again.</p>
        </div>
      </div>
    );
  }

  const total = summary.data.totalResponses;

  return (
    <div className="min-h-full bg-[#f5f2ec] px-6 py-8 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-[#1a1812]">Analytics</h1>
          <p className="mt-1 text-sm text-[#7a7060]">
            Submission trends and field-level breakdowns for {form.title}.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Total responses" value={total} icon={Users} />
          <StatCard label="Last 7 days" value={summary.data.last7DaysCount} icon={CalendarDays} />
          <StatCard label="Last 30 days" value={summary.data.last30DaysCount} icon={BarChart3} />
          <StatCard
            label="Last response"
            value={
              summary.data.lastResponseAt
                ? format(new Date(summary.data.lastResponseAt), "MMM d")
                : "—"
            }
            icon={Star}
          />
        </div>

        {total === 0 ? (
          <div className="rounded-2xl border border-[#e8e0d4] bg-[#faf9f6] px-6 py-20 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#f0ebe0] text-2xl">
              📊
            </div>
            <h2 className="text-base font-semibold text-[#1a1812]">No responses yet</h2>
            <p className="mt-1 text-sm text-[#7a7060]">
              Publish and share this form to see analytics populate.
            </p>
          </div>
        ) : (
          <>
            <section className="rounded-2xl border border-[#e8e0d4] bg-[#faf9f6] p-5">
              <div className="mb-5">
                <h2 className="text-sm font-semibold text-[#1a1812]">Responses over time</h2>
                <p className="mt-1 text-xs text-[#9a9080]">Last 30 days</p>
              </div>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={summary.data.responsesByDay}>
                    <CartesianGrid stroke="#ece3d7" vertical={false} />
                    <XAxis dataKey="date" tickLine={false} axisLine={false} tick={{ fontSize: 11 }} />
                    <YAxis allowDecimals={false} tickLine={false} axisLine={false} tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="count"
                      stroke="#0f0e0b"
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </section>

            <section className="grid gap-4 lg:grid-cols-2">
              {breakdown.data.map((item) => (
                <div key={item.fieldId} className="rounded-2xl border border-[#e8e0d4] bg-[#faf9f6] p-5">
                  <h2 className="text-sm font-semibold text-[#1a1812]">{item.label}</h2>
                  <p className="mt-1 text-xs capitalize text-[#9a9080]">
                    {item.type.replaceAll("_", " ")}
                  </p>

                  {"buckets" in item ? (
                    <div className="mt-5 h-56">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={item.buckets} layout="vertical" margin={{ left: 12 }}>
                          <CartesianGrid stroke="#ece3d7" horizontal={false} />
                          <XAxis type="number" allowDecimals={false} />
                          <YAxis type="category" dataKey="label" width={100} />
                          <Tooltip />
                          <Bar dataKey="count" fill="#0f0e0b" radius={[0, 6, 6, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  ) : item.type === "rating" ? (
                    <div className="mt-5">
                      <p className="mb-4 text-3xl font-semibold text-[#1a1812]">
                        {item.average.toFixed(1)}
                        <span className="text-sm font-normal text-[#7a7060]"> average</span>
                      </p>
                      <div className="h-48">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={item.distribution}>
                            <CartesianGrid stroke="#ece3d7" vertical={false} />
                            <XAxis dataKey="value" />
                            <YAxis allowDecimals={false} />
                            <Tooltip />
                            <Bar dataKey="count" fill="#f4c95d" radius={[6, 6, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  ) : (
                    <p className="mt-5 rounded-xl border border-[#e8e0d4] bg-white p-4 text-sm text-[#3a3428]">
                      {item.responseCount} {item.responseCount === 1 ? "response" : "responses"} with an answer.
                    </p>
                  )}
                </div>
              ))}
            </section>
          </>
        )}
      </div>
    </div>
  );
}
