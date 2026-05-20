"use client";

import { useFormShell } from "~/components/dashboard/form-shell-context";
import { GeneralSettings } from "~/components/settings/general-settings";
import { VisibilitySettings } from "~/components/settings/visibility-settings";
import { AccessSettings } from "~/components/settings/access-settings";
import { DangerSettings } from "~/components/settings/danger-settings";

export default function FormSettingsPage() {
  const { form } = useFormShell();

  return (
    <div className="min-h-full bg-[#f5f2ec] px-6 py-8 lg:px-8">
      <div className="mx-auto max-w-2xl space-y-6">
        {/* Page header */}
        <div className="mb-8">
          <h1 className="text-xl font-semibold tracking-tight text-[#1a1812]">Form settings</h1>
          <p className="mt-1 text-sm text-[#7a7060]">
            Manage your form&apos;s identity, access, and lifecycle.
          </p>
        </div>

        <GeneralSettings form={form} />
        <VisibilitySettings form={form} />
        <AccessSettings form={form} />
        <DangerSettings form={form} />
      </div>
    </div>
  );
}
