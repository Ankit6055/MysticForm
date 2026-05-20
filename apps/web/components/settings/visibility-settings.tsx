"use client";

import { useState } from "react";
import { Eye, Globe, Link2, Lock, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "~/trpc/client";
import { cn } from "~/lib/utils";
import { SettingsSection, type SectionSaveState } from "./settings-section";
import type { RouterOutputs } from "@repo/trpc/client";

type FormData = RouterOutputs["forms"]["get"]["form"];
type Visibility = "draft" | "unlisted" | "public";

const OPTIONS: Array<{
  value: Visibility;
  label: string;
  description: string;
  icon: React.ElementType;
}> = [
  {
    value: "draft",
    label: "Draft",
    description: "Only you can see this form. It won't appear publicly.",
    icon: Lock,
  },
  {
    value: "unlisted",
    label: "Unlisted",
    description: "Anyone with the direct link can fill it out.",
    icon: Link2,
  },
  {
    value: "public",
    label: "Public",
    description: "Anyone can find and fill out this form.",
    icon: Globe,
  },
];

function basePayload(form: FormData) {
  return {
    id: form.id,
    title: form.title,
    description: form.description ?? undefined,
    slug: form.slug,
    coverEmoji: form.coverEmoji ?? undefined,
    submitLabel: form.submitLabel ?? undefined,
    thankYouMessage: form.thankYouMessage ?? undefined,
    notifyRespondent: form.notifyRespondent ?? undefined,
    responseLimit: form.responseLimit ?? null,
    expiresAt: form.expiresAt ? new Date(form.expiresAt as unknown as string).toISOString() : null,
    themeId: form.themeId ?? null,
  };
}

interface VisibilitySettingsProps {
  form: FormData;
}

export function VisibilitySettings({ form }: VisibilitySettingsProps) {
  const [selected, setSelected] = useState<Visibility>(form.visibility);
  const [saveState, setSaveState] = useState<SectionSaveState>("idle");

  const update = trpc.forms.update.useMutation({
    onMutate: () => setSaveState("saving"),
    onSuccess: () => {
      setSaveState("saved");
      setTimeout(() => setSaveState("idle"), 2000);
    },
    onError: (err) => {
      toast.error(err.message ?? "Failed to update visibility");
      setSaveState("error");
    },
  });

  function handleSave() {
    update.mutate({ ...basePayload(form), visibility: selected });
  }

  return (
    <SettingsSection
      title="Visibility"
      description="Control who can access and discover this form"
      icon={Eye}
      onSave={handleSave}
      saveState={saveState}
    >
      <div className="space-y-2">
        {OPTIONS.map((opt) => {
          const Icon = opt.icon;
          const isSelected = selected === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => setSelected(opt.value)}
              className={cn(
                "flex w-full items-center gap-4 rounded-xl border p-4 text-left transition-all",
                isSelected
                  ? "border-[#c9a83c] bg-[#f4c95d]/8"
                  : "border-[#e8e0d4] bg-white hover:border-[#c8bfb0] hover:bg-[#faf8f4]",
              )}
            >
              <div
                className={cn(
                  "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-colors",
                  isSelected ? "bg-[#f4c95d]/20" : "bg-[#f0ebe0]",
                )}
              >
                <Icon
                  className={cn(
                    "h-4 w-4 transition-colors",
                    isSelected ? "text-[#c9a83c]" : "text-[#7a7060]",
                  )}
                />
              </div>
              <div className="flex-1">
                <p
                  className={cn(
                    "text-sm font-medium transition-colors",
                    isSelected ? "text-[#1a1812]" : "text-[#3a3428]",
                  )}
                >
                  {opt.label}
                </p>
                <p className="mt-0.5 text-xs text-[#7a7060]">{opt.description}</p>
              </div>
              <div
                className={cn(
                  "h-4 w-4 shrink-0 rounded-full border-2 transition-all",
                  isSelected
                    ? "border-[#c9a83c] bg-[#c9a83c]"
                    : "border-[#d8d0c4] bg-transparent",
                )}
              />
            </button>
          );
        })}
      </div>

      {selected === "public" && (
        <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
          <p className="text-sm text-amber-800">
            Anyone can find this form on the explore page and via search engines.
          </p>
        </div>
      )}
    </SettingsSection>
  );
}
