"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Archive, ArchiveRestore, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "~/trpc/client";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { SettingsSection } from "./settings-section";
import type { RouterOutputs } from "@repo/trpc/client";

type FormData = RouterOutputs["forms"]["get"]["form"];

interface DangerSettingsProps {
  form: FormData;
}

function DeleteDialog({ form }: { form: FormData }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [confirm, setConfirm] = useState("");

  const del = trpc.forms.delete.useMutation({
    onSuccess: () => {
      toast.success("Form deleted");
      router.replace("/dashboard");
    },
    onError: (err) => toast.error(err.message ?? "Failed to delete form"),
  });

  const matches = confirm === form.title;

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (!v) setConfirm("");
      }}
    >
      <DialogTrigger asChild>
        <Button
          size="sm"
          variant="outline"
          className="gap-2 border-red-200 bg-white text-red-600 hover:bg-red-50 hover:border-red-300"
        >
          <Trash2 className="h-3.5 w-3.5" />
          Delete form
        </Button>
      </DialogTrigger>

      <DialogContent className="gap-0 rounded-2xl border-red-200 bg-[#faf9f6] p-0 shadow-2xl sm:max-w-md">
        <DialogHeader className="border-b border-red-100 bg-red-50/50 px-6 py-5">
          <DialogTitle className="text-base font-semibold text-red-700">
            Delete form permanently
          </DialogTitle>
        </DialogHeader>

        <div className="px-6 py-5 space-y-4">
          <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3">
            <p className="text-sm text-red-800 leading-relaxed">
              This action <strong>cannot be undone</strong>. The form, all its fields, and all
              collected responses will be permanently deleted.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#1a1812] mb-2">
              Type <span className="font-mono font-semibold text-[#0f0e0b]">{form.title}</span> to
              confirm
            </label>
            <Input
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder={form.title}
              className="border-[#e0d8cc] bg-white focus-visible:border-red-300 focus-visible:ring-red-200/50 text-[#1a1812] placeholder:text-[#b8aea0]"
              autoComplete="off"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-[#e8e0d4] px-6 py-4">
          <Button
            variant="ghost"
            size="sm"
            className="text-[#7a7060]"
            onClick={() => setOpen(false)}
          >
            Cancel
          </Button>
          <Button
            size="sm"
            disabled={!matches || del.isPending}
            onClick={() => del.mutate({ id: form.id })}
            className="gap-2 bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
          >
            {del.isPending ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Trash2 className="h-3.5 w-3.5" />
            )}
            Delete permanently
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function DangerSettings({ form }: DangerSettingsProps) {
  const isArchived = form.status === "archived";

  const archive = trpc.forms.archive.useMutation({
    onSuccess: () => toast.success("Form archived"),
    onError: (err) => toast.error(err.message ?? "Failed to archive"),
  });

  const unarchive = trpc.forms.unarchive.useMutation({
    onSuccess: () => toast.success("Form restored"),
    onError: (err) => toast.error(err.message ?? "Failed to restore"),
  });

  const isPending = archive.isPending || unarchive.isPending;

  return (
    <SettingsSection
      title="Danger zone"
      description="Irreversible actions — proceed with care"
      icon={Trash2}
      danger
    >
      {/* Archive */}
      <div className="flex items-center justify-between gap-6 rounded-xl border border-[#e8e0d4] bg-white p-4">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-50">
            {isArchived ? (
              <ArchiveRestore className="h-4 w-4 text-amber-600" />
            ) : (
              <Archive className="h-4 w-4 text-amber-600" />
            )}
          </div>
          <div>
            <p className="text-sm font-medium text-[#1a1812]">
              {isArchived ? "Restore form" : "Archive form"}
            </p>
            <p className="mt-0.5 text-xs text-[#7a7060]">
              {isArchived
                ? "Move this form back to your active forms list."
                : "Hide this form from your active list. It can be restored later."}
            </p>
          </div>
        </div>
        <Button
          size="sm"
          variant="outline"
          disabled={isPending}
          onClick={() =>
            isArchived
              ? unarchive.mutate({ id: form.id })
              : archive.mutate({ id: form.id })
          }
          className="shrink-0 gap-2 border-amber-200 bg-white text-amber-700 hover:bg-amber-50 hover:border-amber-300"
        >
          {isPending ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : isArchived ? (
            <ArchiveRestore className="h-3.5 w-3.5" />
          ) : (
            <Archive className="h-3.5 w-3.5" />
          )}
          {isArchived ? "Restore" : "Archive"}
        </Button>
      </div>

      {/* Delete */}
      <div className="flex items-center justify-between gap-6 rounded-xl border border-red-100 bg-white p-4">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-red-50">
            <Trash2 className="h-4 w-4 text-red-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-[#1a1812]">Delete this form</p>
            <p className="mt-0.5 text-xs text-[#7a7060]">
              Permanently remove this form, all fields, and all responses. Cannot be undone.
            </p>
          </div>
        </div>
        <DeleteDialog form={form} />
      </div>
    </SettingsSection>
  );
}
