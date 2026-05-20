"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { z } from "zod";
import { toast } from "sonner";
import { passwordSchema } from "@repo/services/user/model";
import { trpc } from "~/trpc/client";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { useQueryClient } from "@tanstack/react-query";
import { getQueryKey } from "@trpc/react-query";

// ── Schemas ──────────────────────────────────────────────────────────────────

const signInSchema = z.object({
  email: z.email("Invalid email").max(255),
  password: z.string().min(1, "Password is required"),
});

const signUpSchema = z
  .object({
    fullName: z.string().trim().min(1, "Full name is required").max(80, "Name is too long"),
    email: z.email("Invalid email").max(255),
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type SignInValues = z.infer<typeof signInSchema>;
type SignUpValues = z.infer<typeof signUpSchema>;

// ── Sub-components ────────────────────────────────────────────────────────────

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="mt-1 text-xs text-red-500">{message}</p>;
}

function PasswordInput({
  id,
  placeholder,
  ...props
}: React.ComponentProps<"input"> & { id: string; placeholder?: string }) {
  const [shown, setShown] = useState(false);
  return (
    <div className="relative">
      <Input
        id={id}
        type={shown ? "text" : "password"}
        placeholder={placeholder ?? "••••••••"}
        className="pr-10 bg-white border-[#e0d8cc] focus-visible:border-[#c9a83c] focus-visible:ring-[#f4c95d]/30 text-[#2a2520] placeholder:text-[#b8aea0]"
        {...props}
      />
      <button
        type="button"
        tabIndex={-1}
        onClick={() => setShown((v) => !v)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9a9080] hover:text-[#2a2520] transition-colors"
        aria-label={shown ? "Hide password" : "Show password"}
      >
        {shown ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </div>
  );
}

function Label({ htmlFor, children }: { htmlFor: string; children: React.ReactNode }) {
  return (
    <label
      htmlFor={htmlFor}
      className="block text-sm font-medium text-[#3a3428] mb-1.5"
    >
      {children}
    </label>
  );
}

// ── Sign-in form ──────────────────────────────────────────────────────────────

function SignInForm({ next }: { next?: string }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [authError, setAuthError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignInValues>({ resolver: zodResolver(signInSchema), mode: "onBlur" });

  const signIn = trpc.auth.signIn.useMutation({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: getQueryKey(trpc.auth.me) });
      router.replace(next ?? "/dashboard");
    },
    onError: (err) => {
      if (err.data?.code === "UNAUTHORIZED" || err.data?.code === "NOT_FOUND") {
        setAuthError("Invalid email or password.");
      } else {
        toast.error(err.message ?? "Something went wrong. Try again.");
      }
    },
  });

  function onSubmit(values: SignInValues) {
    setAuthError(null);
    signIn.mutate(values);
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      {authError && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {authError}
        </div>
      )}

      <div>
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="you@example.com"
          autoComplete="email"
          className="bg-white border-[#e0d8cc] focus-visible:border-[#c9a83c] focus-visible:ring-[#f4c95d]/30 text-[#2a2520] placeholder:text-[#b8aea0]"
          aria-invalid={!!errors.email}
          {...register("email")}
        />
        <FieldError message={errors.email?.message} />
      </div>

      <div>
        <Label htmlFor="password">Password</Label>
        <PasswordInput
          id="password"
          autoComplete="current-password"
          aria-invalid={!!errors.password}
          {...register("password")}
        />
        <FieldError message={errors.password?.message} />
      </div>

      <Button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-[#0f0e0b] text-[#f4c95d] hover:bg-[#2a2520] disabled:opacity-70 h-10 text-sm font-medium"
      >
        {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Sign in"}
      </Button>
    </form>
  );
}

// ── Sign-up form ──────────────────────────────────────────────────────────────

function SignUpForm({ next }: { next?: string }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [authError, setAuthError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignUpValues>({ resolver: zodResolver(signUpSchema), mode: "onBlur" });

  const signUp = trpc.auth.signUp.useMutation({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: getQueryKey(trpc.auth.me) });
      router.replace(next ?? "/dashboard");
    },
    onError: (err) => {
      if (err.data?.code === "CONFLICT") {
        setAuthError("An account with this email already exists. Try signing in.");
      } else {
        toast.error(err.message ?? "Something went wrong. Try again.");
      }
    },
  });

  function onSubmit(values: SignUpValues) {
    setAuthError(null);
    signUp.mutate({
      fullName: values.fullName,
      email: values.email,
      password: values.password,
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      {authError && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {authError}
        </div>
      )}

      <div>
        <Label htmlFor="fullName">Full name</Label>
        <Input
          id="fullName"
          type="text"
          placeholder="Alex Johnson"
          autoComplete="name"
          className="bg-white border-[#e0d8cc] focus-visible:border-[#c9a83c] focus-visible:ring-[#f4c95d]/30 text-[#2a2520] placeholder:text-[#b8aea0]"
          aria-invalid={!!errors.fullName}
          {...register("fullName")}
        />
        <FieldError message={errors.fullName?.message} />
      </div>

      <div>
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="you@example.com"
          autoComplete="email"
          className="bg-white border-[#e0d8cc] focus-visible:border-[#c9a83c] focus-visible:ring-[#f4c95d]/30 text-[#2a2520] placeholder:text-[#b8aea0]"
          aria-invalid={!!errors.email}
          {...register("email")}
        />
        <FieldError message={errors.email?.message} />
      </div>

      <div>
        <Label htmlFor="password">Password</Label>
        <PasswordInput
          id="password"
          autoComplete="new-password"
          aria-invalid={!!errors.password}
          {...register("password")}
        />
        <FieldError message={errors.password?.message} />
      </div>

      <div>
        <Label htmlFor="confirmPassword">Confirm password</Label>
        <PasswordInput
          id="confirmPassword"
          autoComplete="new-password"
          aria-invalid={!!errors.confirmPassword}
          {...register("confirmPassword")}
        />
        <FieldError message={errors.confirmPassword?.message} />
      </div>

      <Button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-[#0f0e0b] text-[#f4c95d] hover:bg-[#2a2520] disabled:opacity-70 h-10 text-sm font-medium"
      >
        {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create account"}
      </Button>
    </form>
  );
}

// ── Export ────────────────────────────────────────────────────────────────────

interface EmailPasswordFormProps {
  mode: "signIn" | "signUp";
  next?: string;
}

export function EmailPasswordForm({ mode, next }: EmailPasswordFormProps) {
  return mode === "signIn" ? <SignInForm next={next} /> : <SignUpForm next={next} />;
}
