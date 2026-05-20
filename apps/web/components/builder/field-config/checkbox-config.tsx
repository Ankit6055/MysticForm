"use client";

import { Switch } from "~/components/ui/switch";
import { BaseConfig } from "./base-config";
import type { BuilderField } from "~/hooks/use-form-builder";

interface CheckboxConfigProps {
  field: BuilderField;
  onUpdate: (patch: Partial<BuilderField>) => void;
}

export function CheckboxConfig({ field, onUpdate }: CheckboxConfigProps) {
  const cfg = field.config;

  return (
    <BaseConfig field={field} onUpdate={onUpdate}>
      <div className="flex items-center justify-between rounded-lg border border-[#e8e0d4] bg-[#f5f2ec] px-4 py-3">
        <div>
          <p className="text-sm font-medium text-[#1a1812]">Checked by default</p>
          <p className="text-xs text-[#9a9080]">Pre-check this box for respondents</p>
        </div>
        <Switch
          checked={(cfg.defaultChecked as boolean) ?? false}
          onCheckedChange={(checked) => onUpdate({ config: { ...cfg, defaultChecked: checked } })}
          className="data-[state=checked]:bg-[#c9a83c]"
        />
      </div>
    </BaseConfig>
  );
}
