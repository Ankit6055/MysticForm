const steps = [
  ["Create", "Start with a blank form or clone a template, then add fields with validation."],
  ["Publish", "Choose public for discovery or unlisted for direct-link distribution."],
  ["Share", "Send a link, collect responses, and review analytics from the dashboard."],
];

export function HowItWorks() {
  return (
    <section className="border-y border-black/10 bg-[#191713] text-[#eef4ef] dark:border-white/10">
      <div className="mx-auto grid w-full max-w-7xl gap-10 px-4 py-20 sm:px-6 lg:grid-cols-[0.85fr_1.15fr] lg:px-8">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#f4c95d]">Three moves</p>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
            From idea to live form in minutes.
          </h2>
          <div className="mt-8 rounded-md border border-white/10 bg-white/5 p-4 font-mono text-sm text-[#f4c95d]">
            mysticform.app/f/your-form
          </div>
        </div>
        <div className="grid gap-4">
          {steps.map(([title, copy], index) => (
            <div key={title} className="grid gap-4 rounded-md border border-white/10 bg-white/[0.04] p-5 sm:grid-cols-[48px_1fr]">
              <div className="flex size-12 items-center justify-center rounded-md bg-[#f4c95d] font-semibold text-[#191713]">
                {index + 1}
              </div>
              <div>
                <h3 className="text-lg font-semibold">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-[#d8cfbf]">{copy}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
