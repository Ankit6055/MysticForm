import { SiteFooter } from "~/components/site-footer";
import { SiteNav } from "~/components/site-nav";

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-[#eef4ef] text-[#1a1812]">
      <SiteNav />
      <section className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#7a7060]">
          Legal
        </p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight">Privacy policy</h1>
        <div className="mt-8 space-y-6 text-sm leading-7 text-[#5f5a4e]">
          <p>
            MysticForm stores account details, form configuration, and submitted answers so
            creators can manage forms and review responses.
          </p>
          <p>
            Public forms may collect respondent answers, email addresses when an email field
            is present, browser user agents, and hashed IP addresses for basic spam
            protection.
          </p>
          <p>
            This demo does not sell data or run billing. Delete forms you no longer need, and
            avoid collecting sensitive data while evaluating the app.
          </p>
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}
