"use client";

import { useState } from "react";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { Checkbox } from "~/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "~/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Label } from "~/components/ui/label";
import { cn } from "~/lib/utils";
import type { BuilderField } from "~/hooks/use-form-builder";

interface FieldRendererProps {
  field: BuilderField;
  value: unknown;
  onChange: (value: unknown) => void;
  error?: string;
}

type Option = { value: string; label: string };

export function FieldRenderer({ field, value, onChange, error }: FieldRendererProps) {
  const { type, label, helpText, required, config } = field;

  function wrap(children: React.ReactNode) {
    return (
      <div className="space-y-2">
        <div className="space-y-0.5">
          <p className="text-base font-medium text-[#1a1812]">
            {label}
            {required && <span className="ml-1 text-red-500">*</span>}
          </p>
          {helpText && <p className="text-sm text-[#7a7060]">{helpText}</p>}
        </div>
        {children}
        {error && <p className="text-xs text-red-500">{error}</p>}
      </div>
    );
  }

  if (type === "short_text" || type === "email") {
    return wrap(
      <Input
        type={type === "email" ? "email" : "text"}
        placeholder={(config.placeholder as string) ?? ""}
        value={(value as string) ?? ""}
        onChange={(e) => onChange(e.target.value)}
        className="border-[#e0d8cc] bg-white focus-visible:border-[#c9a83c] focus-visible:ring-[#f4c95d]/30"
      />,
    );
  }

  if (type === "long_text") {
    return wrap(
      <Textarea
        placeholder={(config.placeholder as string) ?? ""}
        value={(value as string) ?? ""}
        onChange={(e) => onChange(e.target.value)}
        className="min-h-24 border-[#e0d8cc] bg-white focus-visible:border-[#c9a83c] focus-visible:ring-[#f4c95d]/30"
      />,
    );
  }

  if (type === "number") {
    return wrap(
      <Input
        type="number"
        placeholder={(config.placeholder as string) ?? ""}
        value={(value as string) ?? ""}
        min={config.min as number | undefined}
        max={config.max as number | undefined}
        step={config.step as number | undefined}
        onChange={(e) => onChange(e.target.value)}
        className="border-[#e0d8cc] bg-white focus-visible:border-[#c9a83c] focus-visible:ring-[#f4c95d]/30"
      />,
    );
  }

  if (type === "date") {
    return wrap(
      <Input
        type="date"
        value={(value as string) ?? ""}
        min={config.min as string | undefined}
        max={config.max as string | undefined}
        onChange={(e) => onChange(e.target.value)}
        className="border-[#e0d8cc] bg-white focus-visible:border-[#c9a83c] focus-visible:ring-[#f4c95d]/30"
      />,
    );
  }

  if (type === "checkbox") {
    return (
      <div className="flex items-start gap-3">
        <Checkbox
          id={field.id}
          checked={(value as boolean) ?? false}
          onCheckedChange={(checked) => onChange(!!checked)}
          className="mt-0.5 border-[#c8bfb0] data-[state=checked]:border-[#c9a83c] data-[state=checked]:bg-[#c9a83c]"
        />
        <label htmlFor={field.id} className="cursor-pointer text-sm text-[#3a3428] leading-relaxed">
          {label}
          {required && <span className="ml-1 text-red-500">*</span>}
          {helpText && <span className="ml-1 text-[#9a9080]">— {helpText}</span>}
        </label>
        {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
      </div>
    );
  }

  if (type === "single_select") {
    const options = (config.options as Option[]) ?? [];
    return wrap(
      <RadioGroup
        value={(value as string) ?? ""}
        onValueChange={onChange}
        className="gap-2"
      >
        {options.map((opt) => (
          <div key={opt.value} className="flex items-center gap-3">
            <RadioGroupItem
              id={`${field.id}-${opt.value}`}
              value={opt.value}
              className="border-[#c8bfb0] text-[#c9a83c]"
            />
            <Label
              htmlFor={`${field.id}-${opt.value}`}
              className="cursor-pointer font-normal text-[#3a3428]"
            >
              {opt.label}
            </Label>
          </div>
        ))}
      </RadioGroup>,
    );
  }

  if (type === "multi_select") {
    const options = (config.options as Option[]) ?? [];
    const selected = (value as string[]) ?? [];
    return wrap(
      <div className="space-y-2">
        {options.map((opt) => (
          <div key={opt.value} className="flex items-center gap-3">
            <Checkbox
              id={`${field.id}-${opt.value}`}
              checked={selected.includes(opt.value)}
              onCheckedChange={(checked) => {
                onChange(
                  checked
                    ? [...selected, opt.value]
                    : selected.filter((v) => v !== opt.value),
                );
              }}
              className="border-[#c8bfb0] data-[state=checked]:border-[#c9a83c] data-[state=checked]:bg-[#c9a83c]"
            />
            <Label
              htmlFor={`${field.id}-${opt.value}`}
              className="cursor-pointer font-normal text-[#3a3428]"
            >
              {opt.label}
            </Label>
          </div>
        ))}
      </div>,
    );
  }

  if (type === "dropdown") {
    const options = (config.options as Option[]) ?? [];
    return wrap(
      <Select value={(value as string) ?? ""} onValueChange={onChange}>
        <SelectTrigger className="w-full border-[#e0d8cc] bg-white focus:border-[#c9a83c] focus:ring-[#f4c95d]/30">
          <SelectValue placeholder="Select an option…" />
        </SelectTrigger>
        <SelectContent>
          {options.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>,
    );
  }

  if (type === "rating") {
    const scale = (config.scale as number) ?? 5;
    const icon = (config.icon as string) ?? "star";
    const current = (value as number) ?? 0;

    const icons: Record<string, (filled: boolean) => string> = {
      star: (f) => (f ? "★" : "☆"),
      heart: (f) => (f ? "♥" : "♡"),
      thumb: (_f) => "👍",
    };

    return wrap(
      <div className="flex gap-1">
        {Array.from({ length: scale }, (_, i) => i + 1).map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => onChange(n === current ? 0 : n)}
            className={cn(
              "text-2xl transition-transform hover:scale-110 focus:outline-none",
              n <= current ? "text-[#f4c95d]" : "text-[#d8d0c4]",
            )}
          >
            {icons[icon]?.(n <= current) ?? "★"}
          </button>
        ))}
      </div>,
    );
  }

  return null;
}
