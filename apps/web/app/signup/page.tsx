import Link from "next/link";
import { AuthCard } from "~/components/auth/auth-card";
import { GoogleButton } from "~/components/auth/google-button";
import { EmailPasswordForm } from "~/components/auth/email-password-form";

interface SignupPageProps {
  searchParams: Promise<{ next?: string }>;
}

export default async function SignupPage({ searchParams }: SignupPageProps) {
  const { next } = await searchParams;

  return (
    <AuthCard mode="signup">
      {/* Heading */}
      <div className="auth-fade-in mb-8" style={{ "--fade-delay": "0s" } as React.CSSProperties}>
        <h1 className="text-2xl font-semibold tracking-tight text-[#1a1812]">Create account</h1>
        <p className="mt-1 text-sm text-[#7a7060]">Start building beautiful forms</p>
      </div>

      {/* Google */}
      <div
        className="auth-fade-in mb-4"
        style={{ "--fade-delay": "0.08s" } as React.CSSProperties}
      >
        <GoogleButton next={next} />
      </div>

      {/* Divider */}
      <div
        className="auth-fade-in relative my-5 flex items-center"
        style={{ "--fade-delay": "0.14s" } as React.CSSProperties}
      >
        <div className="flex-1 border-t border-[#e5ddd2]" />
        <span className="mx-4 text-xs font-medium text-[#9a9080]">or</span>
        <div className="flex-1 border-t border-[#e5ddd2]" />
      </div>

      {/* Email/password form */}
      <div
        className="auth-fade-in"
        style={{ "--fade-delay": "0.2s" } as React.CSSProperties}
      >
        <EmailPasswordForm mode="signUp" next={next} />
      </div>

      {/* Switch link */}
      <p
        className="auth-fade-in mt-6 text-center text-sm text-[#7a7060]"
        style={{ "--fade-delay": "0.28s" } as React.CSSProperties}
      >
        Already have an account?{" "}
        <Link
          href={next ? `/login?next=${encodeURIComponent(next)}` : "/login"}
          className="font-medium text-[#1a1812] underline underline-offset-2 hover:text-[#c9a83c] transition-colors"
        >
          Sign in
        </Link>
      </p>
    </AuthCard>
  );
}
