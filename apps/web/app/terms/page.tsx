import { SiteFooter } from "~/components/site-footer";
import { SiteNav } from "~/components/site-nav";

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-[#eef4ef] text-[#1a1812]">
      <SiteNav />
      <section className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#7a7060]">
          Legal
        </p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight">Terms of service</h1>
        <div className="mt-8 space-y-6 text-sm leading-7 text-[#5f5a4e]">
          <p>
            MysticForm is a hackathon demo for building, publishing, and analyzing forms.
            Use it only with data you are comfortable testing in a demo environment.
          </p>
          <p>
            You are responsible for the forms you create, the links you share, and the
            responses you collect. Do not use MysticForm to collect sensitive information,
            passwords, payment data, or regulated personal data.
          </p>
          <p>
            The service may change, reset, or become unavailable while the demo is being
            developed. Export important responses before deleting forms or changing access
            settings.
          </p>
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}
