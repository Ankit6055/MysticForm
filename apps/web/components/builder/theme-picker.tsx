"use client";

import { useState } from "react";
import { Palette, Check, X } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "~/trpc/client";
import { Button } from "~/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "~/components/ui/sheet";
import { cn } from "~/lib/utils";

interface ThemePickerProps {
  formId: string;
  currentThemeId: string | null | undefined;
  formTitle: string;
  formSlug: string;
  formVisibility: "draft" | "unlisted" | "public";
}

export function ThemePicker({ formId, currentThemeId, formTitle, formSlug, formVisibility }: ThemePickerProps) {
  const [selectedId, setSelectedId] = useState<string | null>(currentThemeId ?? null);

  const { data: themes = [] } = trpc.themes.list.useQuery(undefined, { staleTime: 300_000 });

  const update = trpc.forms.update.useMutation({
    onSuccess: () => toast.success("Theme applied"),
    onError: () => toast.error("Failed to apply theme"),
  });

  function applyTheme(themeId: string | null) {
    setSelectedId(themeId);
    update.mutate({
      id: formId,
      themeId: themeId ?? null,
      title: formTitle,
      slug: formSlug,
      visibility: formVisibility,
    });
  }

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          size="sm"
          variant="ghost"
          className="gap-1.5 text-[#7a7060] hover:bg-[#f0ebe0] hover:text-[#1a1812]"
        >
          <Palette className="h-4 w-4" />
          Theme
        </Button>
      </SheetTrigger>
      <SheetContent
        side="right"
        className="w-80 border-[#e8e0d4] bg-[#faf9f6] p-0"
      >
        <SheetHeader className="border-b border-[#e8e0d4] px-5 py-4">
          <SheetTitle className="text-base font-semibold text-[#1a1812]">Theme</SheetTitle>
        </SheetHeader>

        <div className="overflow-y-auto p-4">
          {/* No theme option */}
          <button
            type="button"
            onClick={() => applyTheme(null)}
            className={cn(
              "mb-3 flex w-full items-center gap-3 rounded-xl border p-3 text-left transition-all",
              !selectedId
                ? "border-[#c9a83c] bg-[#f4c95d]/10"
                : "border-[#e8e0d4] bg-white hover:border-[#c8bfb0]",
            )}
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#f0ebe0]">
              <X className="h-4 w-4 text-[#9a9080]" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-[#1a1812]">Default</p>
              <p className="text-xs text-[#9a9080]">No custom theme</p>
            </div>
            {!selectedId && <Check className="h-4 w-4 text-[#c9a83c]" />}
          </button>

          <div className="space-y-2">
            {themes.map((theme) => {
              const isActive = selectedId === theme.id;
              return (
                <button
                  key={theme.id}
                  type="button"
                  onClick={() => applyTheme(theme.id)}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-xl border p-3 text-left transition-all",
                    isActive
                      ? "border-[#c9a83c] bg-[#f4c95d]/10"
                      : "border-[#e8e0d4] bg-white hover:border-[#c8bfb0]",
                  )}
                >
                  {/* Color swatches */}
                  <div className="flex h-10 w-10 shrink-0 overflow-hidden rounded-lg">
                    <div className="flex-1" style={{ background: theme.tokens.background }} />
                    <div className="flex-1" style={{ background: theme.tokens.accent }} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-[#1a1812]">{theme.name}</p>
                    {theme.description && (
                      <p className="truncate text-xs text-[#9a9080]">{theme.description}</p>
                    )}
                  </div>
                  {isActive && <Check className="h-4 w-4 shrink-0 text-[#c9a83c]" />}
                </button>
              );
            })}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
