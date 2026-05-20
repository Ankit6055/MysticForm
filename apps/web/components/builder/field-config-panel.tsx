"use client";

import { MousePointerClick } from "lucide-react";
import { TextConfig } from "./field-config/text-config";
import { NumberConfig } from "./field-config/number-config";
import { SelectConfig } from "./field-config/select-config";
import { RatingConfig } from "./field-config/rating-config";
import { DateConfig } from "./field-config/date-config";
import { CheckboxConfig } from "./field-config/checkbox-config";
import type { BuilderField } from "~/hooks/use-form-builder";

interface FieldConfigPanelProps {
  field: BuilderField | null;
  onUpdate: (patch: Partial<BuilderField>) => void;
}

export function FieldConfigPanel({ field, onUpdate }: FieldConfigPanelProps) {
  if (!field) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 bg-[#faf9f6] px-8 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#f0ebe0]">
          <MousePointerClick className="h-5 w-5 text-[#9a9080]" />
        </div>
        <p className="text-sm font-medium text-[#3a3428]">Select a field</p>
        <p className="text-xs text-[#9a9080]">Click a field on the left to configure it</p>
      </div>
    );
  }

  const { type } = field;

  const panelContent = (() => {
    if (type === "short_text" || type === "long_text" || type === "email") {
      return <TextConfig key={field.id} field={field} onUpdate={onUpdate} />;
    }
    if (type === "number") {
      return <NumberConfig key={field.id} field={field} onUpdate={onUpdate} />;
    }
    if (type === "single_select" || type === "multi_select" || type === "dropdown") {
      return <SelectConfig key={field.id} field={field} onUpdate={onUpdate} />;
    }
    if (type === "rating") {
      return <RatingConfig key={field.id} field={field} onUpdate={onUpdate} />;
    }
    if (type === "date") {
      return <DateConfig key={field.id} field={field} onUpdate={onUpdate} />;
    }
    if (type === "checkbox") {
      return <CheckboxConfig key={field.id} field={field} onUpdate={onUpdate} />;
    }
    return null;
  })();

  return (
    <div className="flex h-full flex-col bg-[#faf9f6]">
      {/* Panel header */}
      <div className="border-b border-[#e8e0d4] px-5 py-4">
        <p className="text-xs font-semibold uppercase tracking-widest text-[#9a9080]">
          Configure field
        </p>
      </div>

      {/* Scrollable config area */}
      <div className="flex-1 overflow-y-auto p-5">
        {panelContent}
      </div>
    </div>
  );
}
