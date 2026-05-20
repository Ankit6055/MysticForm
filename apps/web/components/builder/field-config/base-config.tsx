"use client";

import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { Switch } from "~/components/ui/switch";
import type { BuilderField } from "~/hooks/use-form-builder";

interface BaseConfigProps {
  field: BuilderField;
  onUpdate: (patch: Partial<BuilderField>) => void;
  children?: React.ReactNode;
}

function ConfigRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-semibold uppercase tracking-widest text-[#9a9080]">
        {label}
      </label>
      {children}
    </div>
  );
}

export { ConfigRow };

export function BaseConfig({ field, onUpdate, children }: BaseConfigProps) {
  return (
    <div className="space-y-5">
      <ConfigRow label="Question label">
        <Input
          value={field.label}
          onChange={(e) => onUpdate({ label: e.target.value })}
          placeholder="Your question here…"
          className="border-[#e0d8cc] bg-white text-[#1a1812] placeholder:text-[#b8aea0] focus-visible:border-[#c9a83c] focus-visible:ring-[#f4c95d]/30"
        />
      </ConfigRow>

      <ConfigRow label="Help text">
        <Textarea
          value={field.helpText ?? ""}
          onChange={(e) => onUpdate({ helpText: e.target.value || undefined })}
          placeholder="Optional description or hint…"
          className="min-h-[60px] border-[#e0d8cc] bg-white text-[#1a1812] placeholder:text-[#b8aea0] focus-visible:border-[#c9a83c] focus-visible:ring-[#f4c95d]/30"
        />
      </ConfigRow>

      <div className="flex items-center justify-between rounded-lg border border-[#e8e0d4] bg-[#f5f2ec] px-4 py-3">
        <div>
          <p className="text-sm font-medium text-[#1a1812]">Required</p>
          <p className="text-xs text-[#9a9080]">Respondents must answer this field</p>
        </div>
        <Switch
          checked={field.required}
          onCheckedChange={(checked) => onUpdate({ required: checked })}
          className="data-[state=checked]:bg-[#c9a83c]"
        />
      </div>

      {children && <div className="border-t border-[#e8e0d4] pt-5 space-y-5">{children}</div>}
    </div>
  );
}
