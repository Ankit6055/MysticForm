import Link from "next/link";
import { ArrowRight, Play } from "lucide-react";
import { Button } from "~/components/ui/button";
import { SiteFooter } from "~/components/site-footer";
import { SiteNav } from "~/components/site-nav";
import { BuilderMock } from "~/components/landing/builder-mock";
import { FeatureGrid } from "~/components/landing/feature-grid";
import { HowItWorks } from "~/components/landing/how-it-works";
import { ThemeShowcase } from "~/components/landing/theme-showcase";
import { api } from "~/trpc/server";

async function getFeaturedForms() {
  try {
    return await api.explore.featured.query({ limit: 4 });
  } catch {
    return [];
  }
}

export default async function Home() {
  const featuredForms = await getFeaturedForms();

  return (
    <main className="min-h-screen bg-[#eef4ef] text-[#191713] dark:bg-[#12110f] dark:text-[#eef4ef]">
      <SiteNav />
      <section className="relative overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-40 bg-[linear-gradient(90deg,#f4c95d33,#1f7a6333,#e255a133)] blur-3xl" />
        <div className="relative mx-auto grid w-full max-w-7xl gap-12 px-4 pb-20 pt-16 sm:px-6 lg:grid-cols-[0.95fr_1.05fr] lg:px-8 lg:pb-28 lg:pt-24">
          <div className="flex flex-col justify-center">
            <p className="w-fit rounded-full border border-black/10 bg-white/60 px-3 py-1 text-sm font-medium text-[#6f551d] dark:border-white/10 dark:bg-white/5 dark:text-[#f4c95d]">
              Typeform-style forms with typed APIs
            </p>
            <h1 className="mt-6 max-w-3xl text-5xl font-semibold leading-[0.98] tracking-tight sm:text-6xl lg:text-7xl">
              Build forms that feel like a product, not a spreadsheet.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-[#635d51] dark:text-[#c8c0b2]">
              MysticForm helps creators design dynamic forms, publish public or unlisted links, collect responses, and read the story behind every submission.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg" className="bg-[#111111] text-white hover:bg-[#2a2925] dark:bg-[#f4c95d] dark:text-[#111111]">
                <Link href="/login">
                  Start building
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-black/15 bg-white/60 dark:border-white/15 dark:bg-white/5">
                <Link href="/explore">
                  <Play className="size-4" />
                  See examples
                </Link>
              </Button>
            </div>
          </div>
          <div className="flex items-center">
            <BuilderMock />
          </div>
        </div>
      </section>
      <FeatureGrid />
      <HowItWorks />
      <ThemeShowcase forms={featuredForms} />
      <SiteFooter />
    </main>
  );
}
