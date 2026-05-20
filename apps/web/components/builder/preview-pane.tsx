"use client";

import { toast } from "sonner";
import { FormRenderer } from "~/components/form-renderer/form-renderer";
import type { BuilderField } from "~/hooks/use-form-builder";

interface PreviewPaneProps {
  title: string;
  description?: string | null;
  fields: BuilderField[];
  submitLabel?: string | null;
  thankYouMessage?: string | null;
}

export function PreviewPane({
  title,
  description,
  fields,
  submitLabel,
  thankYouMessage,
}: PreviewPaneProps) {
  function handleSubmit() {
    toast.info("Preview mode — responses aren't saved.");
  }

  return (
    <div className="flex h-full flex-1 flex-col overflow-hidden bg-[#f5f2ec]">
      {/* Device frame bar */}
      <div className="flex items-center justify-center border-b border-[#e8e0d4] bg-[#faf9f6] py-2">
        <div className="flex items-center gap-1.5 rounded-full bg-[#f0ebe0] px-3 py-1">
          <div className="h-1.5 w-1.5 rounded-full bg-[#c8bfb0]" />
          <span className="text-[10px] font-medium text-[#9a9080]">Preview — not saved</span>
          <div className="h-1.5 w-1.5 rounded-full bg-[#c8bfb0]" />
        </div>
      </div>

      {/* Form preview */}
      <div className="flex-1 overflow-y-auto">
        <FormRenderer
          title={title}
          description={description}
          fields={fields}
          submitLabel={submitLabel}
          thankYouMessage={thankYouMessage}
          onSubmit={handleSubmit}
          isPreview
        />
      </div>
    </div>
  );
}
