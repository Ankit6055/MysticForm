"use client";

import { Input } from "~/components/ui/input";
import { BaseConfig, ConfigRow } from "./base-config";
import type { BuilderField } from "~/hooks/use-form-builder";

interface NumberConfigProps {
  field: BuilderField;
  onUpdate: (patch: Partial<BuilderField>) => void;
}

export function NumberConfig({ field, onUpdate }: NumberConfigProps) {
  const cfg = field.config;

  function updateConfig(patch: Record<string, unknown>) {
    onUpdate({ config: { ...cfg, ...patch } });
  }

  function numField(key: string, label: string, placeholder = "—") {
    return (
      <ConfigRow label={label}>
        <Input
          type="number"
          value={(cfg[key] as number | undefined) ?? ""}
          onChange={(e) =>
            updateConfig({ [key]: e.target.value ? Number(e.target.value) : undefined })
          }
          placeholder={placeholder}
          className="border-[#e0d8cc] bg-white text-[#1a1812] placeholder:text-[#b8aea0] focus-visible:border-[#c9a83c] focus-visible:ring-[#f4c95d]/30"
        />
      </ConfigRow>
    );
  }

  return (
    <BaseConfig field={field} onUpdate={onUpdate}>
      <ConfigRow label="Placeholder">
        <Input
          value={(cfg.placeholder as string) ?? ""}
          onChange={(e) => updateConfig({ placeholder: e.target.value || undefined })}
          placeholder="e.g. Enter a number…"
          className="border-[#e0d8cc] bg-white text-[#1a1812] placeholder:text-[#b8aea0] focus-visible:border-[#c9a83c] focus-visible:ring-[#f4c95d]/30"
        />
      </ConfigRow>
      <div className="grid grid-cols-3 gap-3">
        {numField("min", "Min")}
        {numField("max", "Max")}
        {numField("step", "Step")}
      </div>
    </BaseConfig>
  );
}
