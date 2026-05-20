"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { FileText } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "~/trpc/client";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "~/components/ui/popover";
import { SettingsSection, SettingsRow, type SectionSaveState } from "./settings-section";
import type { RouterOutputs } from "@repo/trpc/client";

type FormData = RouterOutputs["forms"]["get"]["form"];

// ── Emoji picker ──────────────────────────────────────────────────────────────

const COMMON_EMOJI = [
  "📝","📋","📄","📊","📈","📉","🔍","🎯","✨","⭐",
  "💡","🚀","🎉","🎁","💬","📧","📱","💻","🌟","🔥",
  "💯","❤️","🙏","👋","👀","🤝","📌","🗓️","⏰","🏆",
  "🎨","🌈","🌊","🌿","🦋","🌸","☕","🍀","🎵","🎓",
  "🛒","💼","🏠","✅","❓","📣","🔔","💎","🌍","🎯",
];

function EmojiPicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (e: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [custom, setCustom] = useState("");

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#e0d8cc] bg-white text-xl transition-colors hover:border-[#c8bfb0] hover:bg-[#f5f0e8] focus:outline-none focus:ring-2 focus:ring-[#f4c95d]/30"
          title="Pick emoji"
        >
          {value || "📝"}
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="w-72 rounded-xl border-[#e8e0d4] bg-[#faf9f6] p-3 shadow-xl"
      >
        <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-[#9a9080]">
          Choose emoji
        </p>
        <div className="grid grid-cols-10 gap-0.5">
          {COMMON_EMOJI.map((e) => (
            <button
              key={e}
              type="button"
              onClick={() => {
                onChange(e);
                setOpen(false);
              }}
              className="flex h-7 w-7 items-center justify-center rounded-md text-base transition-colors hover:bg-[#f0ebe0] focus:outline-none"
              title={e}
            >
              {e}
            </button>
          ))}
        </div>
        <div className="mt-3 border-t border-[#e8e0d4] pt-3">
          <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-widest text-[#9a9080]">
            Custom
          </p>
          <div className="flex gap-2">
            <Input
              value={custom}
              onChange={(e) => setCustom(e.target.value)}
              placeholder="Paste any emoji…"
              maxLength={8}
              className="h-8 border-[#e0d8cc] bg-white text-sm focus-visible:border-[#c9a83c] focus-visible:ring-[#f4c95d]/30"
            />
            <button
              type="button"
              onClick={() => {
                if (custom.trim()) {
                  onChange(custom.trim());
                  setCustom("");
                  setOpen(false);
                }
              }}
              className="shrink-0 rounded-lg border border-[#e0d8cc] bg-white px-3 py-1 text-xs font-medium text-[#3a3428] transition-colors hover:bg-[#f0ebe0]"
            >
              Use
            </button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

// ── Schema ────────────────────────────────────────────────────────────────────

const schema = z.object({
  slug: z
    .string()
    .min(3, "Must be at least 3 characters")
    .max(80, "Must be at most 80 characters")
    .regex(/^[a-z0-9-]+$/, "Only lowercase letters, numbers, and hyphens"),
  coverEmoji: z.string().max(8).optional(),
  submitLabel: z.string().max(40, "Max 40 characters").optional(),
  thankYouMessage: z.string().max(1000, "Max 1000 characters").optional(),
});

type FormValues = z.infer<typeof schema>;

// ── Component ─────────────────────────────────────────────────────────────────

interface GeneralSettingsProps {
  form: FormData;
}

function basePayload(form: FormData) {
  return {
    id: form.id,
    title: form.title,
    description: form.description ?? undefined,
    visibility: form.visibility,
    notifyRespondent: form.notifyRespondent ?? undefined,
    responseLimit: form.responseLimit ?? null,
    expiresAt: form.expiresAt ? new Date(form.expiresAt as unknown as string).toISOString() : null,
    themeId: form.themeId ?? null,
  };
}

export function GeneralSettings({ form }: GeneralSettingsProps) {
  const [saveState, setSaveState] = useState<SectionSaveState>("idle");

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    setError,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      slug: form.slug,
      coverEmoji: form.coverEmoji ?? "",
      submitLabel: form.submitLabel ?? "",
      thankYouMessage: form.thankYouMessage ?? "",
    },
  });

  const slugValue = watch("slug");
  const emojiValue = watch("coverEmoji") ?? "";

  const update = trpc.forms.update.useMutation({
    onMutate: () => setSaveState("saving"),
    onSuccess: () => {
      setSaveState("saved");
      setTimeout(() => setSaveState("idle"), 2000);
    },
    onError: (err) => {
      if (err.data?.code === "CONFLICT") {
        setError("slug", { message: "This slug is already taken. Choose another." });
        setSaveState("idle");
      } else {
        toast.error(err.message ?? "Failed to save");
        setSaveState("error");
      }
    },
  });

  function onSubmit(values: FormValues) {
    update.mutate({
      ...basePayload(form),
      slug: values.slug,
      coverEmoji: values.coverEmoji || undefined,
      submitLabel: values.submitLabel || undefined,
      thankYouMessage: values.thankYouMessage || undefined,
    });
  }

  const publicUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/f/${slugValue || "…"}`
      : `/f/${slugValue || "…"}`;

  return (
    <SettingsSection
      title="General"
      description="Basic form identity and response messaging"
      icon={FileText}
      onSave={handleSubmit(onSubmit)}
      saveState={saveState}
    >
      {/* Slug */}
      <SettingsRow
        label="Public URL slug"
        description="Lowercase letters, numbers, hyphens only"
      >
        <div className="flex items-center overflow-hidden rounded-lg border border-[#e0d8cc] bg-white focus-within:border-[#c9a83c] focus-within:ring-2 focus-within:ring-[#f4c95d]/30">
          <span className="border-r border-[#e0d8cc] bg-[#f5f0e8] px-3 py-2 text-xs text-[#7a7060] select-none">
            /f/
          </span>
          <input
            className="flex-1 bg-transparent px-3 py-2 text-sm text-[#1a1812] outline-none placeholder:text-[#b8aea0]"
            placeholder="my-form-slug"
            {...register("slug")}
          />
        </div>
        {errors.slug ? (
          <p className="mt-1.5 text-xs text-red-500">{errors.slug.message}</p>
        ) : (
          <p className="mt-1.5 truncate text-xs text-[#9a9080]">{publicUrl}</p>
        )}
      </SettingsRow>

      {/* Cover emoji */}
      <SettingsRow label="Cover emoji" description="Shown on your form card in the dashboard">
        <div className="flex items-center gap-3">
          <EmojiPicker value={emojiValue} onChange={(e) => setValue("coverEmoji", e)} />
          <p className="text-xs text-[#9a9080]">Click to pick from common emoji or paste custom</p>
        </div>
      </SettingsRow>

      {/* Submit label */}
      <SettingsRow label="Submit button label" description="Default: Submit">
        <Input
          placeholder="Submit"
          maxLength={40}
          className="border-[#e0d8cc] bg-white focus-visible:border-[#c9a83c] focus-visible:ring-[#f4c95d]/30 text-[#1a1812] placeholder:text-[#b8aea0]"
          {...register("submitLabel")}
        />
        {errors.submitLabel && (
          <p className="mt-1 text-xs text-red-500">{errors.submitLabel.message}</p>
        )}
      </SettingsRow>

      {/* Thank-you message */}
      <SettingsRow label="Thank-you message" description="Shown after a successful submission">
        <Textarea
          placeholder="Thank you for your response!"
          maxLength={1000}
          className="min-h-[80px] border-[#e0d8cc] bg-white focus-visible:border-[#c9a83c] focus-visible:ring-[#f4c95d]/30 text-[#1a1812] placeholder:text-[#b8aea0]"
          {...register("thankYouMessage")}
        />
        {errors.thankYouMessage && (
          <p className="mt-1 text-xs text-red-500">{errors.thankYouMessage.message}</p>
        )}
      </SettingsRow>
    </SettingsSection>
  );
}
