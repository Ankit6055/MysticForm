import { Cormorant_Garamond } from "next/font/google";
import Link from "next/link";
import { Sparkles } from "lucide-react";

const display = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  style: ["normal", "italic"],
  variable: "--font-display",
});

interface AuthCardProps {
  children: React.ReactNode;
  mode: "signin" | "signup";
}

export function AuthCard({ children, mode }: AuthCardProps) {
  return (
    <div className={`${display.variable} flex min-h-screen`}>
      {/* ── Left decorative panel ─────────────────────────────────── */}
      <div className="relative hidden overflow-hidden bg-[#0f0e0b] lg:flex lg:w-[44%] lg:flex-col lg:justify-between lg:p-12">
        {/* Ambient glow layers */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -right-40 -top-40 h-[500px] w-[500px] rounded-full bg-[#f4c95d]/10 blur-[100px]" />
          <div
            className="absolute -bottom-40 -left-24 h-96 w-96 rounded-full bg-[#1f7a63]/12 blur-[80px]"
            style={{ animationDelay: "2s" }}
          />
          <div className="absolute right-0 top-1/2 h-72 w-72 -translate-y-1/2 rounded-full bg-[#f4c95d]/6 blur-3xl" />
        </div>

        {/* Dot grid */}
        <svg
          className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.055]"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <pattern id="dots" x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse">
              <circle cx="1.5" cy="1.5" r="1.5" fill="#f4c95d" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#dots)" />
        </svg>

        {/* Thin diagonal accent line */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -right-12 top-0 h-full w-px rotate-12 bg-gradient-to-b from-transparent via-[#f4c95d]/20 to-transparent" />
          <div className="absolute -left-8 top-0 h-full w-px -rotate-6 bg-gradient-to-b from-transparent via-[#1f7a63]/15 to-transparent" />
        </div>

        {/* Floating form-field preview cards */}
        <div className="pointer-events-none absolute inset-x-10 top-[28%] space-y-3">
          {/* Card 1 — text input */}
          <div
            className="auth-panel-card rounded-xl border border-white/8 bg-white/5 px-4 py-3 shadow-xl backdrop-blur-sm"
            style={{ "--float-duration": "7s", "--float-delay": "0s" } as React.CSSProperties}
          >
            <p className="mb-2 text-[10px] font-medium uppercase tracking-widest text-[#f4c95d]/70">
              Question 1
            </p>
            <p className="mb-3 text-sm text-white/80">What&apos;s your full name?</p>
            <div className="h-8 rounded-md border border-white/10 bg-white/5 px-3 flex items-center">
              <span className="text-xs text-white/25 italic">Type your answer…</span>
            </div>
          </div>

          {/* Card 2 — rating */}
          <div
            className="auth-panel-card ml-8 rounded-xl border border-white/8 bg-white/5 px-4 py-3 shadow-xl backdrop-blur-sm"
            style={{ "--float-duration": "8s", "--float-delay": "1.2s" } as React.CSSProperties}
          >
            <p className="mb-2 text-[10px] font-medium uppercase tracking-widest text-[#f4c95d]/70">
              Question 2
            </p>
            <p className="mb-3 text-sm text-white/80">Rate your experience</p>
            <div className="flex gap-1.5">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className="flex h-6 w-6 items-center justify-center rounded text-base"
                  style={{ color: i <= 4 ? "#f4c95d" : "rgba(255,255,255,0.15)" }}
                >
                  ★
                </div>
              ))}
            </div>
          </div>

          {/* Card 3 — multiple choice */}
          <div
            className="auth-panel-card rounded-xl border border-white/8 bg-white/5 px-4 py-3 shadow-xl backdrop-blur-sm"
            style={{ "--float-duration": "6.5s", "--float-delay": "2.4s" } as React.CSSProperties}
          >
            <p className="mb-2 text-[10px] font-medium uppercase tracking-widest text-[#f4c95d]/70">
              Question 3
            </p>
            <p className="mb-3 text-sm text-white/80">Which plan fits best?</p>
            <div className="space-y-1.5">
              {["Starter", "Pro", "Enterprise"].map((opt, i) => (
                <div key={opt} className="flex items-center gap-2">
                  <div
                    className="h-3.5 w-3.5 rounded-full border flex items-center justify-center"
                    style={{
                      borderColor: i === 1 ? "#f4c95d" : "rgba(255,255,255,0.2)",
                      backgroundColor: i === 1 ? "#f4c95d" : "transparent",
                    }}
                  >
                    {i === 1 && <div className="h-1.5 w-1.5 rounded-full bg-[#0f0e0b]" />}
                  </div>
                  <span className="text-xs text-white/60">{opt}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Top: Logo */}
        <div className="relative z-10">
          <Link href="/" className="inline-flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#f4c95d] text-[#0f0e0b]">
              <Sparkles className="h-4 w-4" />
            </span>
            <span className="font-semibold tracking-tight text-white">MysticForm</span>
          </Link>
        </div>

        {/* Bottom: Headline */}
        <div className="relative z-10">
          <blockquote
            className="font-[family-name:var(--font-display)] text-4xl font-light italic leading-tight text-white/90"
            style={{ fontStyle: "italic" }}
          >
            Build forms that
            <br />
            <span className="text-[#f4c95d]">speak</span> for
            <br />
            themselves.
          </blockquote>
          <p className="mt-4 text-sm leading-relaxed text-white/40">
            {mode === "signin"
              ? "Welcome back. Your forms are waiting."
              : "Join thousands of creators building better surveys."}
          </p>
          {/* Progress dots */}
          <div className="mt-8 flex gap-2">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="h-1 rounded-full transition-all"
                style={{
                  width: i === 0 ? "24px" : "8px",
                  backgroundColor: i === 0 ? "#f4c95d" : "rgba(255,255,255,0.2)",
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* ── Right form panel ──────────────────────────────────────── */}
      <div className="flex flex-1 flex-col items-center justify-center bg-[#faf8f4] px-6 py-12 lg:px-16">
        {/* Mobile-only logo */}
        <div className="mb-8 lg:hidden">
          <Link href="/" className="inline-flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#0f0e0b] text-[#f4c95d]">
              <Sparkles className="h-4 w-4" />
            </span>
            <span className="font-semibold tracking-tight text-[#0f0e0b]">MysticForm</span>
          </Link>
        </div>

        <div className="w-full max-w-[400px]">{children}</div>

        <p className="mt-10 text-center text-xs text-[#9a9080]">
          By continuing, you agree to our{" "}
          <Link href="/terms" className="underline underline-offset-2 hover:text-[#0f0e0b]">
            Terms
          </Link>{" "}
          and{" "}
          <Link href="/privacy" className="underline underline-offset-2 hover:text-[#0f0e0b]">
            Privacy Policy
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
