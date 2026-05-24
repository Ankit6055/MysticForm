"use client";

import { useEffect, useState } from "react";
import { Lock, Eye, EyeOff, Loader2 } from "lucide-react";
import Link from "next/link";
import { trpc } from "~/trpc/client";
import { PublicFormPage } from "./public-form-page";

interface PasswordPromptProps {
  slug: string;
}

export function PasswordPrompt({ slug }: PasswordPromptProps) {
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [wrongPassword, setWrongPassword] = useState(false);

  // Fetch form with the provided password once submitted
  const { data, isLoading, error } = trpc.forms.getPublic.useQuery(
    { slug, password },
    {
      enabled: submitted && password.length > 0,
      retry: false,
    },
  );

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!password) return;
    setWrongPassword(false);
    setSubmitted(true);
  }

  // If the query errored after submitting → wrong password
  useEffect(() => {
    if (!submitted || !error) return;
    const code = (error as { data?: { code?: string } })?.data?.code;
    if (code === "UNAUTHORIZED" || code === "BAD_REQUEST") {
      setWrongPassword(true);
      setSubmitted(false);
    }
  }, [error, submitted]);

  // Successfully fetched form with password → render it
  if (data) {
    return (
      <PublicFormPage
        form={data.form}
        fields={data.fields}
        slug={slug}
        password={password}
        theme={null}
      />
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#f5f2ec] px-6">
      <div className="w-full max-w-sm">
        {/* Lock icon */}
        <div className="mb-8 flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#0f0e0b]">
            <Lock className="h-7 w-7 text-[#f4c95d]" />
          </div>
        </div>

        <h1 className="mb-2 text-center text-2xl font-semibold text-[#1a1812]">Protected form</h1>
        <p className="mb-8 text-center text-sm text-[#7a7060]">
          This form requires a password to access.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <input
              type={showPwd ? "text" : "password"}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setWrongPassword(false);
              }}
              placeholder="Enter password…"
              autoFocus
              className="w-full rounded-xl border border-[#e0d8cc] bg-white px-4 py-3 pr-12 text-sm text-[#1a1812] outline-none transition-colors placeholder:text-[#b8aea0] focus:border-[#c9a83c] focus:ring-2 focus:ring-[#f4c95d]/30"
            />
            <button
              type="button"
              tabIndex={-1}
              onClick={() => setShowPwd((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9a9080] transition-colors hover:text-[#1a1812]"
            >
              {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>

          {wrongPassword && (
            <p className="text-center text-sm text-red-600">
              Incorrect password. Please try again.
            </p>
          )}

          <button
            type="submit"
            disabled={!password || isLoading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#0f0e0b] py-3 text-sm font-semibold text-[#f4c95d] transition-opacity disabled:opacity-50 hover:opacity-90"
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Continue →"}
          </button>
        </form>

        <p className="mt-8 text-center text-xs text-[#9a9080]">
          <Link href="/" className="underline underline-offset-2 hover:text-[#1a1812]">
            Powered by MysticForm
          </Link>
        </p>
      </div>
    </div>
  );
}
