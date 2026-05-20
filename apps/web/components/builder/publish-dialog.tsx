"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Globe, Link2, Lock } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "~/trpc/client";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { cn } from "~/lib/utils";

type Visibility = "public" | "unlisted" | "draft";

const OPTIONS: Array<{
  value: Visibility;
  label: string;
  description: string;
  icon: React.ElementType;
}> = [
  {
    value: "public",
    label: "Public",
    description: "Anyone can find and fill out this form",
    icon: Globe,
  },
  {
    value: "unlisted",
    label: "Unlisted",
    description: "Anyone with the link can fill it out",
    icon: Link2,
  },
  {
    value: "draft",
    label: "Keep as draft",
    description: "Only you can see this form",
    icon: Lock,
  },
];

interface PublishDialogProps {
  formId: string;
  currentVisibility: string;
}

export function PublishDialog({ formId, currentVisibility }: PublishDialogProps) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<Visibility>(
    (currentVisibility as Visibility) === "draft" ? "unlisted" : (currentVisibility as Visibility),
  );
  const router = useRouter();

  const publish = trpc.forms.publish.useMutation({
    onSuccess: () => {
      toast.success("Form published! 🎉");
      setOpen(false);
      router.push(`/dashboard/forms/${formId}`);
    },
    onError: (err) => toast.error(err.message ?? "Failed to publish"),
  });

  const unpublish = trpc.forms.unpublish.useMutation({
    onSuccess: () => {
      toast.success("Form set back to draft");
      setOpen(false);
    },
    onError: (err) => toast.error(err.message ?? "Failed to update"),
  });

  function handleConfirm() {
    if (selected === "draft") {
      unpublish.mutate({ id: formId });
    } else {
      publish.mutate({ id: formId, visibility: selected });
    }
  }

  const isPending = publish.isPending || unpublish.isPending;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          size="sm"
          className="bg-[#0f0e0b] text-[#f4c95d] hover:bg-[#2a2520] gap-1.5"
        >
          <Globe className="h-3.5 w-3.5" />
          Publish
        </Button>
      </DialogTrigger>
      <DialogContent className="gap-0 rounded-2xl border-[#e8e0d4] bg-[#faf9f6] p-0 shadow-2xl sm:max-w-md">
        <DialogHeader className="border-b border-[#e8e0d4] px-6 py-5">
          <DialogTitle className="text-base font-semibold text-[#1a1812]">
            Publish form
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-2 p-5">
          {OPTIONS.map((opt) => {
            const Icon = opt.icon;
            const isActive = selected === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => setSelected(opt.value)}
                className={cn(
                  "flex w-full items-center gap-4 rounded-xl border p-4 text-left transition-all",
                  isActive
                    ? "border-[#c9a83c] bg-[#f4c95d]/10"
                    : "border-[#e8e0d4] bg-white hover:border-[#c8bfb0]",
                )}
              >
                <div
                  className={cn(
                    "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
                    isActive ? "bg-[#f4c95d]/20" : "bg-[#f0ebe0]",
                  )}
                >
                  <Icon className={cn("h-4 w-4", isActive ? "text-[#c9a83c]" : "text-[#7a7060]")} />
                </div>
                <div>
                  <p className="text-sm font-medium text-[#1a1812]">{opt.label}</p>
                  <p className="text-xs text-[#7a7060]">{opt.description}</p>
                </div>
              </button>
            );
          })}
        </div>

        <div className="flex justify-end gap-2 border-t border-[#e8e0d4] px-5 py-4">
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
            disabled={isPending}
            onClick={handleConfirm}
            className="bg-[#0f0e0b] text-[#f4c95d] hover:bg-[#2a2520] disabled:opacity-70"
          >
            {isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Confirm"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
