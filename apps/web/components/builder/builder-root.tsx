"use client";

import { useState, useRef } from "react";
import { Eye, EyeOff, Check, Loader2, AlertCircle, Pencil } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "~/trpc/client";
import { Button } from "~/components/ui/button";
import { cn } from "~/lib/utils";
import { useFormBuilder } from "~/hooks/use-form-builder";
import { FieldList } from "./field-list";
import { FieldConfigPanel } from "./field-config-panel";
import { PreviewPane } from "./preview-pane";
import { ThemePicker } from "./theme-picker";
import { PublishDialog } from "./publish-dialog";
import type { RouterOutputs } from "@repo/trpc/client";

type FormData = RouterOutputs["forms"]["get"]["form"];
type DBField = RouterOutputs["forms"]["get"]["fields"][number];

interface BuilderRootProps {
  form: FormData;
  initialFields: DBField[];
}

function SaveIndicator({ saveState }: { saveState: string }) {
  if (saveState === "saving") {
    return (
      <div className="flex items-center gap-1.5 text-xs text-[#9a9080]">
        <Loader2 className="h-3 w-3 animate-spin" />
        Saving…
      </div>
    );
  }
  if (saveState === "saved") {
    return (
      <div className="flex items-center gap-1.5 text-xs text-emerald-600">
        <Check className="h-3 w-3" />
        Saved
      </div>
    );
  }
  if (saveState === "error") {
    return (
      <div className="flex items-center gap-1.5 text-xs text-red-500">
        <AlertCircle className="h-3 w-3" />
        Save failed
      </div>
    );
  }
  return null;
}

export function BuilderRoot({ form, initialFields }: BuilderRootProps) {
  const { state, dispatch, handleDragEnd, selectedField } = useFormBuilder(
    form.id,
    initialFields,
  );

  // Inline title editing
  const [title, setTitle] = useState(form.title);
  const [editingTitle, setEditingTitle] = useState(false);
  const titleRef = useRef<HTMLInputElement>(null);

  const updateForm = trpc.forms.update.useMutation({
    onError: () => toast.error("Failed to save title"),
  });

  function commitTitle() {
    setEditingTitle(false);
    if (title.trim() && title.trim() !== form.title) {
      updateForm.mutate({
        id: form.id,
        title: title.trim(),
        slug: form.slug,
        visibility: form.visibility,
      });
    }
  }

  return (
    <div className="flex h-full flex-col bg-[#f5f2ec]">
      {/* ── Top bar ────────────────────────────────────────────── */}
      <header className="flex shrink-0 items-center gap-3 border-b border-[#e8e0d4] bg-[#faf9f6] px-4 py-2.5">
        {/* Inline title */}
        <div className="flex min-w-0 flex-1 items-center gap-2">
          {editingTitle ? (
            <input
              ref={titleRef}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={commitTitle}
              onKeyDown={(e) => {
                if (e.key === "Enter") commitTitle();
                if (e.key === "Escape") {
                  setTitle(form.title);
                  setEditingTitle(false);
                }
              }}
              autoFocus
              className="min-w-0 flex-1 rounded-md border border-[#e0d8cc] bg-white px-2 py-1 text-sm font-semibold text-[#1a1812] outline-none focus:border-[#c9a83c] focus:ring-1 focus:ring-[#f4c95d]/30"
            />
          ) : (
            <button
              type="button"
              onClick={() => setEditingTitle(true)}
              className="group flex min-w-0 items-center gap-1.5 rounded-md px-1.5 py-1 text-sm font-semibold text-[#1a1812] transition-colors hover:bg-[#f0ebe0]"
            >
              <span className="truncate">{title}</span>
              <Pencil className="h-3 w-3 shrink-0 text-[#b8aea0] opacity-0 transition-opacity group-hover:opacity-100" />
            </button>
          )}
          <SaveIndicator saveState={state.saveState} />
        </div>

        {/* Actions */}
        <div className="flex shrink-0 items-center gap-2">
          <ThemePicker
              formId={form.id}
              currentThemeId={form.themeId}
              formTitle={title}
              formSlug={form.slug}
              formVisibility={form.visibility}
            />

          <Button
            size="sm"
            variant="ghost"
            onClick={() => dispatch({ type: "TOGGLE_PREVIEW" })}
            className={cn(
              "gap-1.5",
              state.previewMode
                ? "bg-[#0f0e0b] text-[#f4c95d] hover:bg-[#2a2520]"
                : "text-[#7a7060] hover:bg-[#f0ebe0] hover:text-[#1a1812]",
            )}
          >
            {state.previewMode ? (
              <>
                <EyeOff className="h-3.5 w-3.5" />
                Exit preview
              </>
            ) : (
              <>
                <Eye className="h-3.5 w-3.5" />
                Preview
              </>
            )}
          </Button>

          <PublishDialog formId={form.id} currentVisibility={form.visibility} />
        </div>
      </header>

      {/* ── Main area ──────────────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden">
        {state.previewMode ? (
          <PreviewPane
            title={title}
            description={form.description}
            fields={state.fields}
            submitLabel={form.submitLabel}
            thankYouMessage={form.thankYouMessage}
          />
        ) : (
          <>
            {/* Left: field list (dark) */}
            <FieldList
              fields={state.fields}
              selectedFieldId={state.selectedFieldId}
              dispatch={dispatch}
              onDragEnd={handleDragEnd}
            />

            {/* Right: config panel */}
            <div className="flex-1 overflow-hidden border-l border-[#e8e0d4]">
              <FieldConfigPanel
                field={selectedField}
                onUpdate={(patch) => {
                  if (state.selectedFieldId) {
                    dispatch({ type: "UPDATE_FIELD", id: state.selectedFieldId, patch });
                  }
                }}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
