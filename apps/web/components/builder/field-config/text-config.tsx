"use client";

import { Input } from "~/components/ui/input";
import { BaseConfig, ConfigRow } from "./base-config";
import type { BuilderField } from "~/hooks/use-form-builder";

interface TextConfigProps {
  field: BuilderField;
  onUpdate: (patch: Partial<BuilderField>) => void;
}

export function TextConfig({ field, onUpdate }: TextConfigProps) {
  const cfg = field.config;

  function updateConfig(patch: Record<string, unknown>) {
    onUpdate({ config: { ...cfg, ...patch } });
  }

  return (
    <BaseConfig field={field} onUpdate={onUpdate}>
      <ConfigRow label="Placeholder">
        <Input
          value={(cfg.placeholder as string) ?? ""}
          onChange={(e) => updateConfig({ placeholder: e.target.value || undefined })}
          placeholder="e.g. Type your answer here…"
          className="border-[#e0d8cc] bg-white text-[#1a1812] placeholder:text-[#b8aea0] focus-visible:border-[#c9a83c] focus-visible:ring-[#f4c95d]/30"
        />
      </ConfigRow>

      {field.type !== "email" && (
        <div className="grid grid-cols-2 gap-3">
          <ConfigRow label="Min length">
            <Input
              type="number"
              min={0}
              value={(cfg.minLength as number | undefined) ?? ""}
              onChange={(e) =>
                updateConfig({ minLength: e.target.value ? Number(e.target.value) : undefined })
              }
              placeholder="—"
              className="border-[#e0d8cc] bg-white text-[#1a1812] placeholder:text-[#b8aea0] focus-visible:border-[#c9a83c] focus-visible:ring-[#f4c95d]/30"
            />
          </ConfigRow>
          <ConfigRow label="Max length">
            <Input
              type="number"
              min={1}
              value={(cfg.maxLength as number | undefined) ?? ""}
              onChange={(e) =>
                updateConfig({ maxLength: e.target.value ? Number(e.target.value) : undefined })
              }
              placeholder="—"
              className="border-[#e0d8cc] bg-white text-[#1a1812] placeholder:text-[#b8aea0] focus-visible:border-[#c9a83c] focus-visible:ring-[#f4c95d]/30"
            />
          </ConfigRow>
        </div>
      )}
    </BaseConfig>
  );
}
