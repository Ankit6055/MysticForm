"use client";

import { cn } from "~/lib/utils";
import { BaseConfig, ConfigRow } from "./base-config";
import type { BuilderField } from "~/hooks/use-form-builder";

interface RatingConfigProps {
  field: BuilderField;
  onUpdate: (patch: Partial<BuilderField>) => void;
}

export function RatingConfig({ field, onUpdate }: RatingConfigProps) {
  const cfg = field.config;
  const scale = (cfg.scale as number) ?? 5;
  const icon = (cfg.icon as string) ?? "star";

  function updateConfig(patch: Record<string, unknown>) {
    onUpdate({ config: { ...cfg, ...patch } });
  }

  const scales = [3, 5, 7, 10] as const;
  const icons = [
    { value: "star", label: "★ Star" },
    { value: "heart", label: "♥ Heart" },
    { value: "thumb", label: "👍 Thumb" },
  ];

  return (
    <BaseConfig field={field} onUpdate={onUpdate}>
      <ConfigRow label="Scale">
        <div className="flex gap-2">
          {scales.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => updateConfig({ scale: s })}
              className={cn(
                "flex h-9 w-12 items-center justify-center rounded-lg border text-sm font-medium transition-all",
                scale === s
                  ? "border-[#c9a83c] bg-[#f4c95d]/10 text-[#1a1812]"
                  : "border-[#e0d8cc] bg-white text-[#7a7060] hover:border-[#c8bfb0]",
              )}
            >
              {s}
            </button>
          ))}
        </div>
      </ConfigRow>

      <ConfigRow label="Icon style">
        <div className="flex gap-2">
          {icons.map((ic) => (
            <button
              key={ic.value}
              type="button"
              onClick={() => updateConfig({ icon: ic.value })}
              className={cn(
                "flex h-9 items-center justify-center rounded-lg border px-3 text-sm transition-all",
                icon === ic.value
                  ? "border-[#c9a83c] bg-[#f4c95d]/10 text-[#1a1812] font-medium"
                  : "border-[#e0d8cc] bg-white text-[#7a7060] hover:border-[#c8bfb0]",
              )}
            >
              {ic.label}
            </button>
          ))}
        </div>
      </ConfigRow>

      {/* Preview */}
      <div className="rounded-lg border border-[#e8e0d4] bg-[#faf9f6] p-3">
        <p className="mb-2 text-xs text-[#9a9080]">Preview</p>
        <div className="flex gap-1">
          {Array.from({ length: scale }, (_, i) => (
            <span key={i} className="text-xl text-[#f4c95d]">
              {icon === "star" ? "★" : icon === "heart" ? "♥" : "👍"}
            </span>
          ))}
        </div>
      </div>
    </BaseConfig>
  );
}
