"use client";

import { useState } from "react";
import { Shield, Eye, EyeOff, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "~/trpc/client";
import { Input } from "~/components/ui/input";
import { Switch } from "~/components/ui/switch";
import { Button } from "~/components/ui/button";
import { SettingsSection, SettingsRow, type SectionSaveState } from "./settings-section";
import type { RouterOutputs } from "@repo/trpc/client";

type FormData = RouterOutputs["forms"]["get"]["form"];

function basePayload(form: FormData) {
  return {
    id: form.id,
    title: form.title,
    description: form.description ?? undefined,
    slug: form.slug,
    visibility: form.visibility,
    coverEmoji: form.coverEmoji ?? undefined,
    submitLabel: form.submitLabel ?? undefined,
    thankYouMessage: form.thankYouMessage ?? undefined,
    notifyRespondent: form.notifyRespondent ?? undefined,
    themeId: form.themeId ?? null,
  };
}

function toDatetimeLocal(d: unknown): string {
  if (!d) return "";
  return new Date(d as string).toISOString().slice(0, 16);
}

interface AccessSettingsProps {
  form: FormData;
}

export function AccessSettings({ form }: AccessSettingsProps) {
  // ── Password state ─────────────────────────────────────────────
  const hasPassword = !!form.passwordHash;
  const [pwdEnabled, setPwdEnabled] = useState(hasPassword);
  const [pwdValue, setPwdValue] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [pwdSaveState, setPwdSaveState] = useState<SectionSaveState>("idle");
  const [changingPwd, setChangingPwd] = useState(!hasPassword);

  // ── Limit / expiry state ───────────────────────────────────────
  const [limitEnabled, setLimitEnabled] = useState(form.responseLimit !== null);
  const [limitValue, setLimitValue] = useState(String(form.responseLimit ?? ""));
  const [expiryEnabled, setExpiryEnabled] = useState(form.expiresAt !== null);
  const [expiryValue, setExpiryValue] = useState(toDatetimeLocal(form.expiresAt));
  const [accessSaveState, setAccessSaveState] = useState<SectionSaveState>("idle");

  // ── Mutations ──────────────────────────────────────────────────
  const setPassword = trpc.forms.setPassword.useMutation({
    onMutate: () => setPwdSaveState("saving"),
    onSuccess: () => {
      setPwdSaveState("saved");
      setPwdValue("");
      setChangingPwd(false);
      setTimeout(() => setPwdSaveState("idle"), 2000);
    },
    onError: (err) => {
      toast.error(err.message ?? "Failed to update password");
      setPwdSaveState("error");
    },
  });

  const updateAccess = trpc.forms.update.useMutation({
    onMutate: () => setAccessSaveState("saving"),
    onSuccess: () => {
      setAccessSaveState("saved");
      setTimeout(() => setAccessSaveState("idle"), 2000);
    },
    onError: (err) => {
      toast.error(err.message ?? "Failed to save access settings");
      setAccessSaveState("error");
    },
  });

  function handlePasswordSave() {
    if (!pwdEnabled) {
      // Remove password
      setPassword.mutate({ id: form.id, password: null });
      return;
    }
    if (!pwdValue || pwdValue.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }
    setPassword.mutate({ id: form.id, password: pwdValue });
  }

  function handleAccessSave() {
    const responseLimit = limitEnabled && limitValue ? parseInt(limitValue, 10) : null;
    const expiresAt = expiryEnabled && expiryValue
      ? new Date(expiryValue).toISOString()
      : null;

    updateAccess.mutate({
      ...basePayload(form),
      responseLimit,
      expiresAt,
    });
  }

  return (
    <div className="space-y-4">
      {/* Password protection card */}
      <SettingsSection
        title="Access"
        description="Restrict who can respond to this form"
        icon={Shield}
        onSave={handlePasswordSave}
        saveState={pwdSaveState}
        saveLabel="Save password"
      >
        {/* Password toggle */}
        <SettingsRow
          label="Password protection"
          description="Respondents must enter a password before viewing"
        >
          <div className="flex items-center gap-3">
            <Switch
              checked={pwdEnabled}
              onCheckedChange={(v) => {
                setPwdEnabled(v);
                if (!v) setChangingPwd(false);
                else if (!hasPassword) setChangingPwd(true);
              }}
              className="data-[state=checked]:bg-[#c9a83c]"
            />
            {hasPassword && pwdEnabled && !changingPwd && (
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-xs font-medium text-emerald-700">
                  Protected
                </span>
                <button
                  type="button"
                  onClick={() => setChangingPwd(true)}
                  className="text-xs text-[#7a7060] underline underline-offset-2 hover:text-[#1a1812] transition-colors"
                >
                  Change password
                </button>
              </div>
            )}
          </div>
        </SettingsRow>

        {/* Password input */}
        {pwdEnabled && changingPwd && (
          <SettingsRow label="New password" description="Min 8 characters">
            <div className="relative">
              <Input
                type={showPwd ? "text" : "password"}
                value={pwdValue}
                onChange={(e) => setPwdValue(e.target.value)}
                placeholder={hasPassword ? "Enter new password" : "Set a password…"}
                className="pr-10 border-[#e0d8cc] bg-white focus-visible:border-[#c9a83c] focus-visible:ring-[#f4c95d]/30 text-[#1a1812] placeholder:text-[#b8aea0]"
              />
              <button
                type="button"
                tabIndex={-1}
                onClick={() => setShowPwd((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9a9080] hover:text-[#1a1812] transition-colors"
              >
                {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </SettingsRow>
        )}

        {/* Response limit */}
        <SettingsRow
          label="Response limit"
          description="Stop accepting responses after N submissions"
        >
          <div className="flex items-center gap-3">
            <Switch
              checked={limitEnabled}
              onCheckedChange={(v) => {
                setLimitEnabled(v);
                if (!v) setLimitValue("");
              }}
              className="data-[state=checked]:bg-[#c9a83c]"
            />
            {limitEnabled && (
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  min={1}
                  value={limitValue}
                  onChange={(e) => setLimitValue(e.target.value)}
                  placeholder="e.g. 100"
                  className="w-28 border-[#e0d8cc] bg-white focus-visible:border-[#c9a83c] focus-visible:ring-[#f4c95d]/30 text-[#1a1812] placeholder:text-[#b8aea0]"
                />
                <span className="text-sm text-[#7a7060]">responses</span>
              </div>
            )}
          </div>
        </SettingsRow>

        {/* Expiry */}
        <SettingsRow
          label="Expiry date"
          description="Stop accepting responses after this date and time"
        >
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-3">
              <Switch
                checked={expiryEnabled}
                onCheckedChange={(v) => {
                  setExpiryEnabled(v);
                  if (!v) setExpiryValue("");
                }}
                className="data-[state=checked]:bg-[#c9a83c]"
              />
              {expiryEnabled && (
                <Input
                  type="datetime-local"
                  value={expiryValue}
                  onChange={(e) => setExpiryValue(e.target.value)}
                  className="w-56 border-[#e0d8cc] bg-white focus-visible:border-[#c9a83c] focus-visible:ring-[#f4c95d]/30 text-[#1a1812]"
                />
              )}
            </div>
          </div>
        </SettingsRow>

        {/* Separate save button for limit + expiry */}
        <div className="flex items-center justify-between rounded-xl border border-[#e8e0d4] bg-[#f5f2ec]/60 px-4 py-3">
          <p className="text-xs text-[#9a9080]">Response limit &amp; expiry settings</p>
          <Button
            size="sm"
            onClick={handleAccessSave}
            disabled={accessSaveState === "saving"}
            className="bg-[#0f0e0b] text-[#f4c95d] hover:bg-[#2a2520] disabled:opacity-60 h-8 px-4 text-xs font-medium"
          >
            {accessSaveState === "saving" ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : accessSaveState === "saved" ? (
              "Saved ✓"
            ) : (
              "Save limits"
            )}
          </Button>
        </div>
      </SettingsSection>
    </div>
  );
}
