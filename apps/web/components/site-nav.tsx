import Link from "next/link";
import { FileText, Sparkles } from "lucide-react";
import { Button } from "~/components/ui/button";
import { env } from "~/env";

function getDocsHref() {
  const apiBase = env.NEXT_PUBLIC_API_URL?.replace(/\/trpc\/?$/, "") ?? "http://localhost:8000";
  return `${apiBase}/docs`;
}

export function SiteNav() {
  return (
    <header className="sticky top-0 z-40 border-b border-black/10 bg-[#eef4ef]/90 backdrop-blur-xl dark:border-white/10 dark:bg-[#12110f]/90">
      <nav className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight">
          <span className="flex size-9 items-center justify-center rounded-md bg-[#111111] text-[#f4c95d] dark:bg-[#f4c95d] dark:text-[#111111]">
            <Sparkles className="size-4" />
          </span>
          <span className="text-lg">MysticForm</span>
        </Link>

        <div className="hidden items-center gap-7 text-sm font-medium text-[#5f5a4e] md:flex dark:text-[#c8c0b2]">
          <Link href="/explore" className="transition hover:text-foreground">
            Explore
          </Link>
          <Link href="/pricing" className="transition hover:text-foreground">
            Pricing
          </Link>
          <Link href={getDocsHref()} className="inline-flex items-center gap-1 transition hover:text-foreground">
            <FileText className="size-3.5" />
            Docs
          </Link>
        </div>

        <div className="flex items-center gap-2">
          <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
            <Link href="/login">Log in</Link>
          </Button>
          <Button asChild size="sm" className="bg-[#111111] text-white hover:bg-[#2a2925] dark:bg-[#f4c95d] dark:text-[#111111] dark:hover:bg-[#e5b947]">
            <Link href="/login">Start building</Link>
          </Button>
        </div>
      </nav>
      <div className="mx-auto flex w-full max-w-7xl items-center gap-5 overflow-x-auto px-4 pb-3 text-sm font-medium text-[#5f5a4e] sm:px-6 md:hidden dark:text-[#c8c0b2]">
        <Link href="/explore" className="shrink-0 transition hover:text-foreground">
          Explore
        </Link>
        <Link href="/pricing" className="shrink-0 transition hover:text-foreground">
          Pricing
        </Link>
        <Link href={getDocsHref()} className="inline-flex shrink-0 items-center gap-1 transition hover:text-foreground">
          <FileText className="size-3.5" />
          Docs
        </Link>
        <Link href="/login" className="shrink-0 transition hover:text-foreground">
          Log in
        </Link>
      </div>
    </header>
  );
}
