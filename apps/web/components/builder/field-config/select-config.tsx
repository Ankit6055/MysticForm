"use client";

import { useState } from "react";
import { Plus, Trash2, GripVertical } from "lucide-react";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { BaseConfig, ConfigRow } from "./base-config";
import type { BuilderField } from "~/hooks/use-form-builder";

type UIOption = { _id: string; value: string; label: string };

function toUIOptions(raw: unknown[]): UIOption[] {
  return (raw as Array<{ value: string; label: string }>).map((o) => ({
    _id: crypto.randomUUID(),
    value: o.value,
    label: o.label,
  }));
}

function toDBOptions(opts: UIOption[]): Array<{ value: string; label: string }> {
  return opts.map(({ value, label }) => ({ value, label }));
}

interface SelectConfigProps {
  field: BuilderField;
  onUpdate: (patch: Partial<BuilderField>) => void;
}

export function SelectConfig({ field, onUpdate }: SelectConfigProps) {
  const cfg = field.config;
  const rawOptions = (cfg.options as Array<{ value: string; label: string }>) ?? [];
  const [uiOptions, setUiOptions] = useState<UIOption[]>(() => toUIOptions(rawOptions));

  function pushOptions(next: UIOption[]) {
    setUiOptions(next);
    onUpdate({ config: { ...cfg, options: toDBOptions(next) } });
  }

  function addOption() {
    const n = uiOptions.length + 1;
    pushOptions([
      ...uiOptions,
      { _id: crypto.randomUUID(), value: `option-${n}`, label: `Option ${n}` },
    ]);
  }

  function removeOption(id: string) {
    pushOptions(uiOptions.filter((o) => o._id !== id));
  }

  function updateOption(id: string, patch: Partial<UIOption>) {
    pushOptions(uiOptions.map((o) => (o._id === id ? { ...o, ...patch } : o)));
  }

  const isMulti = field.type === "multi_select";

  return (
    <BaseConfig field={field} onUpdate={onUpdate}>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-widest text-[#9a9080]">
            Options
          </span>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={addOption}
            className="h-7 gap-1 px-2 text-xs text-[#7a7060] hover:text-[#1a1812]"
          >
            <Plus className="h-3 w-3" />
            Add
          </Button>
        </div>

        <div className="space-y-1.5">
          {uiOptions.map((opt, idx) => (
            <div key={opt._id} className="flex items-center gap-2">
              <GripVertical className="h-4 w-4 shrink-0 text-[#b8aea0]" />
              <Input
                value={opt.label}
                onChange={(e) => updateOption(opt._id, { label: e.target.value, value: e.target.value.toLowerCase().replace(/\s+/g, "-") || `option-${idx + 1}` })}
                placeholder={`Option ${idx + 1}`}
                className="border-[#e0d8cc] bg-white text-sm text-[#1a1812] placeholder:text-[#b8aea0] focus-visible:border-[#c9a83c] focus-visible:ring-[#f4c95d]/30"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                onClick={() => removeOption(opt._id)}
                disabled={uiOptions.length <= 1}
                className="h-7 w-7 shrink-0 text-[#9a9080] hover:text-red-500"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          ))}
        </div>
      </div>

      {isMulti && (
        <div className="grid grid-cols-2 gap-3">
          <ConfigRow label="Min selected">
            <Input
              type="number"
              min={0}
              value={(cfg.minSelected as number | undefined) ?? ""}
              onChange={(e) =>
                onUpdate({
                  config: {
                    ...cfg,
                    minSelected: e.target.value ? Number(e.target.value) : undefined,
                  },
                })
              }
              placeholder="—"
              className="border-[#e0d8cc] bg-white text-[#1a1812] placeholder:text-[#b8aea0] focus-visible:border-[#c9a83c] focus-visible:ring-[#f4c95d]/30"
            />
          </ConfigRow>
          <ConfigRow label="Max selected">
            <Input
              type="number"
              min={1}
              value={(cfg.maxSelected as number | undefined) ?? ""}
              onChange={(e) =>
                onUpdate({
                  config: {
                    ...cfg,
                    maxSelected: e.target.value ? Number(e.target.value) : undefined,
                  },
                })
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
