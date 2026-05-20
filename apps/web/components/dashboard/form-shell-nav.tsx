"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "~/lib/utils";

const tabs = [
  { label: "Edit", segment: "edit" },
  { label: "Settings", segment: "settings" },
  { label: "Responses", segment: "responses" },
  { label: "Analytics", segment: "analytics" },
];

interface FormShellNavProps {
  formId: string;
}

export function FormShellNav({ formId }: FormShellNavProps) {
  const pathname = usePathname();
  const base = `/dashboard/forms/${formId}`;

  return (
    <nav className="flex gap-0 border-b border-[#e8e0d4] bg-[#faf9f6] px-6">
      {tabs.map(({ label, segment }) => {
        const href = `${base}/${segment}`;
        const isActive = pathname === href || pathname.startsWith(`${href}/`);
        return (
          <Link
            key={segment}
            href={href}
            className={cn(
              "relative px-4 py-3 text-sm font-medium transition-colors",
              isActive
                ? "text-[#1a1812]"
                : "text-[#7a7060] hover:text-[#3a3428]",
            )}
          >
            {label}
            {isActive && (
              <span className="absolute inset-x-0 bottom-0 h-0.5 rounded-full bg-[#0f0e0b]" />
            )}
          </Link>
        );
      })}
    </nav>
  );
}
