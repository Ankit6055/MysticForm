"use client";

import { createContext, useContext } from "react";
import type { RouterOutputs } from "@repo/trpc/client";

type FormShellData = {
  form: RouterOutputs["forms"]["get"]["form"];
  fields: RouterOutputs["forms"]["get"]["fields"];
};

const FormShellContext = createContext<FormShellData | null>(null);

export function FormShellProvider({
  form,
  fields,
  children,
}: FormShellData & { children: React.ReactNode }) {
  return (
    <FormShellContext.Provider value={{ form, fields }}>
      {children}
    </FormShellContext.Provider>
  );
}

export function useFormShell(): FormShellData {
  const ctx = useContext(FormShellContext);
  if (!ctx) throw new Error("useFormShell must be used inside FormShellProvider");
  return ctx;
}
