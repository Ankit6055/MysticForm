import { BarChart3, Braces, Download, EyeOff, Palette, TextCursorInput } from "lucide-react";
import { Card, CardContent } from "~/components/ui/card";

const features = [
  {
    icon: TextCursorInput,
    title: "Dynamic fields",
    copy: "Compose short text, long text, email, numbers, selects, ratings, dates, and checkboxes.",
  },
  {
    icon: Palette,
    title: "Themes that ship",
    copy: "Give every form its own visual language without custom CSS for every launch.",
  },
  {
    icon: EyeOff,
    title: "Public or unlisted",
    copy: "Publish to discovery pages or keep forms hidden behind direct share links.",
  },
  {
    icon: BarChart3,
    title: "Analytics built in",
    copy: "Track submissions over time and see response breakdowns for choice and rating fields.",
  },
  {
    icon: Download,
    title: "CSV export",
    copy: "Take every response with you in a spreadsheet-friendly format.",
  },
  {
    icon: Braces,
    title: "Typed API access",
    copy: "Use tRPC, OpenAPI, and Scalar docs when forms need to plug into a workflow.",
  },
];

export function FeatureGrid() {
  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
      <div className="max-w-2xl">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#9b6f2d] dark:text-[#f4c95d]">
          Product surface
        </p>
        <h2 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
          Everything a form builder needs before the demo starts.
        </h2>
      </div>
      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((feature) => (
          <Card key={feature.title} className="rounded-md border-black/10 bg-white/70 shadow-none transition hover:-translate-y-1 hover:shadow-lg dark:border-white/10 dark:bg-white/5">
            <CardContent className="p-6">
              <feature.icon className="size-6 text-[#9b6f2d] dark:text-[#f4c95d]" />
              <h3 className="mt-5 text-lg font-semibold">{feature.title}</h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{feature.copy}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
