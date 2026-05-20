import { redirect } from "next/navigation";
import Link from "next/link";
import { Sparkles, LayoutGrid, MessageSquare, Compass, Settings, LayoutTemplate } from "lucide-react";
import { api } from "~/trpc/server";
import { SignOutButton } from "~/components/sign-out-button";

const navItems = [
  { href: "/dashboard", icon: LayoutGrid, label: "Forms" },
  { href: "/templates", icon: LayoutTemplate, label: "Templates" },
  { href: "/dashboard/responses", icon: MessageSquare, label: "Responses" },
  { href: "/explore", icon: Compass, label: "Explore" },
  { href: "/dashboard/settings", icon: Settings, label: "Settings" },
];

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  let user;
  try {
    user = await api.auth.me.query();
  } catch {
    user = null;
  }

  if (!user) {
    redirect("/login?next=/dashboard");
  }

  return (
    <div className="flex h-screen bg-[#f5f3ee]">
      {/* ── Sidebar ───────────────────────────────────────────────── */}
      <aside className="flex w-60 shrink-0 flex-col border-r border-[#e5ddd2] bg-[#faf8f4]">
        {/* Logo */}
        <div className="flex h-16 items-center gap-2.5 border-b border-[#e5ddd2] px-5">
          <Link href="/" className="inline-flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#0f0e0b] text-[#f4c95d]">
              <Sparkles className="h-3.5 w-3.5" />
            </span>
            <span className="text-sm font-semibold tracking-tight text-[#1a1812]">MysticForm</span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-0.5 overflow-y-auto p-3">
          {navItems.map(({ href, icon: Icon, label }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-[#5f5a4e] transition-colors hover:bg-[#ede8de] hover:text-[#1a1812]"
            >
              <Icon className="h-4 w-4 shrink-0" />
              {label}
            </Link>
          ))}
        </nav>

        {/* User menu */}
        <div className="border-t border-[#e5ddd2] p-3">
          <div className="mb-2 flex items-center gap-3 rounded-lg px-3 py-2">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#0f0e0b] text-xs font-semibold text-[#f4c95d]">
              {user.fullName.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-[#1a1812]">{user.fullName}</p>
              <p className="truncate text-xs text-[#7a7060]">{user.email}</p>
            </div>
          </div>
          <SignOutButton className="w-full justify-start text-[#7a7060] hover:text-[#1a1812]" />
        </div>
      </aside>

      {/* ── Main content ──────────────────────────────────────────── */}
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}
