"use client";

import { BuilderRoot } from "~/components/builder/builder-root";
import { useFormShell } from "~/components/dashboard/form-shell-context";

export default function FormEditPage() {
  const { form, fields } = useFormShell();
  return <BuilderRoot form={form} initialFields={fields} />;
}
