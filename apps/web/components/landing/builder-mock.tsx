import { BarChart3, GripVertical, Mail, Star, Type } from "lucide-react";

const fields = [
  { icon: Type, label: "Launch idea", value: "Short text", active: true },
  { icon: Mail, label: "Founder email", value: "Email" },
  { icon: Star, label: "Hype score", value: "Rating" },
];

export function BuilderMock() {
  return (
    <div className="relative mx-auto w-full max-w-xl overflow-hidden rounded-md border border-black/10 bg-[#fbfff9] shadow-2xl shadow-[#2d2414]/15 dark:border-white/10 dark:bg-[#1d1a16]">
      <div className="flex items-center justify-between border-b border-black/10 px-4 py-3 dark:border-white/10">
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-[#9b6f2d] dark:text-[#f4c95d]">Builder</p>
          <p className="mt-1 text-sm font-semibold">Startup launch survey</p>
        </div>
        <div className="rounded-full bg-[#1f7a63] px-3 py-1 text-xs font-medium text-white">Public</div>
      </div>
      <div className="grid gap-0 md:grid-cols-[1fr_190px]">
        <div className="space-y-3 p-4">
          {fields.map((field) => (
            <div
              key={field.label}
              className={`flex items-center gap-3 rounded-md border p-3 ${
                field.active
                  ? "border-[#d99a28] bg-[#fff2cc] dark:border-[#f4c95d] dark:bg-[#2b2414]"
                  : "border-black/10 bg-white/70 dark:border-white/10 dark:bg-white/5"
              }`}
            >
              <GripVertical className="size-4 text-[#8c8270]" />
              <field.icon className="size-4 text-[#9b6f2d] dark:text-[#f4c95d]" />
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{field.label}</p>
                <p className="text-xs text-muted-foreground">{field.value}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="border-t border-black/10 bg-[#e4eee7] p-4 md:border-l md:border-t-0 dark:border-white/10 dark:bg-[#15130f]">
          <div className="mb-5 flex items-center gap-2 text-sm font-semibold">
            <BarChart3 className="size-4" />
            Live preview
          </div>
          <div className="space-y-3 rounded-md bg-white p-3 dark:bg-[#24211d]">
            <div className="h-2 w-24 rounded-full bg-[#f4c95d]" />
            <div className="h-8 rounded-md border border-black/10 dark:border-white/10" />
            <div className="grid grid-cols-5 gap-1">
              {Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className="h-7 rounded-md bg-[#111111] dark:bg-[#f4c95d]" />
              ))}
            </div>
            <div className="h-8 rounded-md bg-[#1f7a63]" />
          </div>
        </div>
      </div>
    </div>
  );
}
