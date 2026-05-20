import { SiteFooter } from "~/components/site-footer";
import { SiteNav } from "~/components/site-nav";
import { PricingClient } from "~/components/landing/pricing-client";

export default function PricingPage() {
  return (
    <main className="min-h-screen bg-[#eef4ef] text-[#191713] dark:bg-[#12110f] dark:text-[#eef4ef]">
      <SiteNav />
      <PricingClient />
      <SiteFooter />
    </main>
  );
}
