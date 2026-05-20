"use client";

import { Input } from "~/components/ui/input";
import { BaseConfig, ConfigRow } from "./base-config";
import type { BuilderField } from "~/hooks/use-form-builder";

interface DateConfigProps {
  field: BuilderField;
  onUpdate: (patch: Partial<BuilderField>) => void;
}

export function DateConfig({ field, onUpdate }: DateConfigProps) {
  const cfg = field.config;

  function updateConfig(patch: Record<string, unknown>) {
    onUpdate({ config: { ...cfg, ...patch } });
  }

  return (
    <BaseConfig field={field} onUpdate={onUpdate}>
      <div className="grid grid-cols-2 gap-3">
        <ConfigRow label="Earliest date">
          <Input
            type="date"
            value={(cfg.min as string) ?? ""}
            onChange={(e) => updateConfig({ min: e.target.value || undefined })}
            className="border-[#e0d8cc] bg-white text-[#1a1812] focus-visible:border-[#c9a83c] focus-visible:ring-[#f4c95d]/30"
          />
        </ConfigRow>
        <ConfigRow label="Latest date">
          <Input
            type="date"
            value={(cfg.max as string) ?? ""}
            onChange={(e) => updateConfig({ max: e.target.value || undefined })}
            className="border-[#e0d8cc] bg-white text-[#1a1812] focus-visible:border-[#c9a83c] focus-visible:ring-[#f4c95d]/30"
          />
        </ConfigRow>
      </div>
    </BaseConfig>
  );
}
