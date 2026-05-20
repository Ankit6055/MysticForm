"use client";

import { Check } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { Card, CardContent } from "~/components/ui/card";
import { Button } from "~/components/ui/button";

const tiers = [
  {
    name: "Hobby",
    monthly: 0,
    copy: "For side projects and personal communities.",
    features: ["3 forms", "100 responses/mo", "MysticForm branding", "Public + unlisted forms"],
  },
  {
    name: "Pro",
    monthly: 12,
    copy: "For launches, creators, and serious feedback loops.",
    features: ["50 forms", "10k responses/mo", "Custom themes", "CSV export", "No branding", "Email notifications"],
    featured: true,
  },
  {
    name: "Team",
    monthly: 39,
    copy: "For teams who need APIs and protected collection.",
    features: ["Unlimited forms", "100k responses/mo", "API access", "Password-protected forms", "Priority support"],
  },
];

const faqs = [
  ["Do you store responses securely?", "Responses are stored in Postgres and raw IPs are not stored; abuse checks use salted IP hashes."],
  ["Can I export my data?", "Yes. Creators can export form responses as CSV for spreadsheets or downstream tools."],
  ["Is there an API?", "Yes. The API is documented with Scalar and backed by tRPC procedures."],
  ["Hackathon-built — is this production?", "The architecture is production-style, but billing, compliance reviews, and operational hardening are intentionally out of scope for the demo."],
];

function price(monthly: number, annual: boolean) {
  if (monthly === 0) return "Free";
  return `$${annual ? Math.round(monthly * 0.8) : monthly}/mo`;
}

export function PricingClient() {
  return (
    <Tabs defaultValue="monthly" className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#9b6f2d] dark:text-[#f4c95d]">
            Pricing
          </p>
          <h1 className="mt-4 max-w-3xl text-5xl font-semibold tracking-tight sm:text-6xl">
            Pick a plan before your forms take off.
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-muted-foreground">
            No checkout is wired for the hackathon demo, but the plans model a real SaaS packaging path.
          </p>
        </div>
        <TabsList className="bg-white/70 dark:bg-white/10">
          <TabsTrigger value="monthly">Monthly</TabsTrigger>
          <TabsTrigger value="annual">Annual -20%</TabsTrigger>
        </TabsList>
      </div>

      {[false, true].map((annual) => (
        <TabsContent key={String(annual)} value={annual ? "annual" : "monthly"} className="mt-10">
          <div className="grid gap-4 lg:grid-cols-3">
            {tiers.map((tier) => (
              <Card
                key={tier.name}
                className={`rounded-md py-0 shadow-none ${
                  tier.featured
                    ? "border-[#d99a28] bg-[#191713] text-[#eef4ef]"
                    : "border-black/10 bg-white/70 dark:border-white/10 dark:bg-white/5"
                }`}
              >
                <CardContent className="flex h-full flex-col p-6">
                  <div>
                    <h2 className="text-2xl font-semibold">{tier.name}</h2>
                    <p className={`mt-3 text-sm leading-6 ${tier.featured ? "text-[#d8cfbf]" : "text-muted-foreground"}`}>
                      {tier.copy}
                    </p>
                    <p className="mt-8 text-4xl font-semibold">{price(tier.monthly, annual)}</p>
                  </div>
                  <ul className="mt-8 space-y-3 text-sm">
                    {tier.features.map((feature) => (
                      <li key={feature} className="flex gap-3">
                        <Check className={`mt-0.5 size-4 ${tier.featured ? "text-[#f4c95d]" : "text-[#1f7a63]"}`} />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button className={`mt-8 ${tier.featured ? "bg-[#f4c95d] text-[#191713] hover:bg-[#e5b947]" : ""}`}>
                    Choose {tier.name}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      ))}

      <section className="mt-20 grid gap-4 md:grid-cols-2">
        {faqs.map(([question, answer]) => (
          <div key={question} className="rounded-md border border-black/10 bg-white/60 p-5 dark:border-white/10 dark:bg-white/5">
            <h3 className="font-semibold">{question}</h3>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">{answer}</p>
          </div>
        ))}
      </section>
    </Tabs>
  );
}
