import Link from "next/link";

const links = [
  { href: "/explore", label: "Explore" },
  { href: "/pricing", label: "Pricing" },
  { href: "/login", label: "Log in" },
  { href: "https://github.com/piyushgarg-dev/trpc-monorepo", label: "GitHub" },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-black/10 bg-[#191713] text-[#eef4ef] dark:border-white/10">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-10 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
        <div>
          <p className="text-lg font-semibold">MysticForm</p>
          <p className="mt-2 max-w-xl text-sm text-[#d8cfbf]">
            Built for the hackathon by Ankit.
          </p>
        </div>
        <div className="flex flex-wrap gap-5 text-sm text-[#d8cfbf]">
          {links.map((link) => (
            <Link key={link.href} href={link.href} className="transition hover:text-white">
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </footer>
  );
}
