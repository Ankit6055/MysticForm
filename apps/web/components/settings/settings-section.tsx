"use client";

import { Check, Loader2, AlertCircle } from "lucide-react";
import { Button } from "~/components/ui/button";
import { cn } from "~/lib/utils";

export type SectionSaveState = "idle" | "saving" | "saved" | "error";

interface SettingsSectionProps {
  title: string;
  description?: string;
  icon: React.ElementType;
  children: React.ReactNode;
  onSave?: () => void;
  saveState?: SectionSaveState;
  danger?: boolean;
  saveLabel?: string;
}

function InlineSaveState({ state }: { state: SectionSaveState }) {
  if (state === "saving")
    return (
      <span className="flex items-center gap-1.5 text-xs text-[#9a9080]">
        <Loader2 className="h-3 w-3 animate-spin" /> Saving…
      </span>
    );
  if (state === "saved")
    return (
      <span className="flex items-center gap-1.5 text-xs text-emerald-600">
        <Check className="h-3 w-3" /> Saved
      </span>
    );
  if (state === "error")
    return (
      <span className="flex items-center gap-1.5 text-xs text-red-500">
        <AlertCircle className="h-3 w-3" /> Failed to save
      </span>
    );
  return null;
}

export function SettingsSection({
  title,
  description,
  icon: Icon,
  children,
  onSave,
  saveState = "idle",
  danger = false,
  saveLabel = "Save changes",
}: SettingsSectionProps) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-2xl border bg-[#faf9f6]",
        danger ? "border-red-200" : "border-[#e8e0d4]",
      )}
    >
      {/* Header */}
      <div
        className={cn(
          "border-b px-6 py-4",
          danger ? "border-red-100 bg-red-50/40" : "border-[#e8e0d4]",
        )}
      >
        <div className="flex items-center gap-2.5">
          <div
            className={cn(
              "flex h-7 w-7 items-center justify-center rounded-lg",
              danger ? "bg-red-100" : "bg-[#f0ebe0]",
            )}
          >
            <Icon className={cn("h-3.5 w-3.5", danger ? "text-red-600" : "text-[#7a7060]")} />
          </div>
          <h2
            className={cn(
              "text-sm font-semibold",
              danger ? "text-red-700" : "text-[#1a1812]",
            )}
          >
            {title}
          </h2>
        </div>
        {description && (
          <p className="mt-1 pl-[calc(28px+10px)] text-xs text-[#9a9080]">{description}</p>
        )}
      </div>

      {/* Body */}
      <div className="space-y-5 px-6 py-5">{children}</div>

      {/* Footer */}
      {onSave && (
        <div className="flex items-center justify-between border-t border-[#e8e0d4] bg-[#f5f2ec]/60 px-6 py-3">
          <InlineSaveState state={saveState} />
          <Button
            size="sm"
            onClick={onSave}
            disabled={saveState === "saving"}
            className="bg-[#0f0e0b] text-[#f4c95d] hover:bg-[#2a2520] disabled:opacity-60 h-8 px-4 text-xs font-medium"
          >
            {saveState === "saving" ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : saveState === "saved" ? (
              "Saved ✓"
            ) : (
              saveLabel
            )}
          </Button>
        </div>
      )}
    </div>
  );
}

// Helper for labelled form rows
export function SettingsRow({
  label,
  description,
  children,
}: {
  label: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5 sm:flex-row sm:items-start sm:gap-8">
      <div className="sm:w-44 sm:shrink-0 sm:pt-2">
        <p className="text-sm font-medium text-[#1a1812]">{label}</p>
        {description && <p className="mt-0.5 text-xs leading-relaxed text-[#9a9080]">{description}</p>}
      </div>
      <div className="flex-1">{children}</div>
    </div>
  );
}
