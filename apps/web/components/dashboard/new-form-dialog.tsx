"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { Plus, Loader2 } from "lucide-react";
import { z } from "zod";
import { toast } from "sonner";
import { trpc } from "~/trpc/client";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";

const schema = z.object({
  title: z.string().min(1, "Title is required").max(120, "Title is too long"),
  slug: z
    .string()
    .regex(/^[a-z0-9-]*$/, "Only lowercase letters, numbers, and hyphens")
    .min(3, "Slug must be at least 3 characters")
    .max(80)
    .optional()
    .or(z.literal("")),
});

type FormValues = z.infer<typeof schema>;

export function NewFormDialog() {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const create = trpc.forms.create.useMutation({
    onSuccess: (form) => {
      setOpen(false);
      reset();
      router.push(`/dashboard/forms/${form.id}/edit`);
    },
    onError: (err) => {
      if (err.data?.code === "CONFLICT") {
        toast.error("That slug is already taken. Try a different one.");
      } else {
        toast.error(err.message ?? "Failed to create form.");
      }
    },
  });

  function onSubmit(values: FormValues) {
    create.mutate({
      title: values.title,
      slug: values.slug || undefined,
    });
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (!v) reset();
      }}
    >
      <DialogTrigger asChild>
        <Button className="bg-[#0f0e0b] text-[#f4c95d] hover:bg-[#2a2520] gap-1.5 text-sm font-medium">
          <Plus className="h-4 w-4" />
          New form
        </Button>
      </DialogTrigger>

      <DialogContent className="gap-0 rounded-2xl border-[#e8e0d4] bg-[#faf9f6] p-0 shadow-2xl sm:max-w-md">
        <DialogHeader className="border-b border-[#e8e0d4] px-6 py-5">
          <DialogTitle className="text-base font-semibold text-[#1a1812]">
            Create a new form
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 px-6 py-5">
          <div>
            <label
              htmlFor="title"
              className="block text-sm font-medium text-[#3a3428] mb-1.5"
            >
              Form title <span className="text-red-500">*</span>
            </label>
            <Input
              id="title"
              placeholder="e.g. Customer satisfaction survey"
              autoFocus
              className="border-[#e0d8cc] bg-white focus-visible:border-[#c9a83c] focus-visible:ring-[#f4c95d]/30 text-[#2a2520] placeholder:text-[#b8aea0]"
              aria-invalid={!!errors.title}
              {...register("title")}
            />
            {errors.title && (
              <p className="mt-1 text-xs text-red-500">{errors.title.message}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="slug"
              className="block text-sm font-medium text-[#3a3428] mb-1.5"
            >
              Custom URL slug{" "}
              <span className="text-xs font-normal text-[#9a9080]">(optional)</span>
            </label>
            <div className="flex items-center gap-0 overflow-hidden rounded-md border border-[#e0d8cc] bg-white focus-within:border-[#c9a83c] focus-within:ring-2 focus-within:ring-[#f4c95d]/30">
              <span className="border-r border-[#e0d8cc] bg-[#f5f0e8] px-3 py-2 text-xs text-[#7a7060] select-none">
                /f/
              </span>
              <input
                id="slug"
                placeholder="my-form-slug"
                className="flex-1 bg-transparent px-3 py-2 text-sm text-[#2a2520] outline-none placeholder:text-[#b8aea0]"
                {...register("slug")}
              />
            </div>
            {errors.slug && (
              <p className="mt-1 text-xs text-red-500">{errors.slug.message}</p>
            )}
            <p className="mt-1 text-xs text-[#9a9080]">
              Left blank, a slug will be generated automatically.
            </p>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="text-[#7a7060]"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || create.isPending}
              className="bg-[#0f0e0b] text-[#f4c95d] hover:bg-[#2a2520] disabled:opacity-70"
              size="sm"
            >
              {create.isPending ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                "Create form"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
