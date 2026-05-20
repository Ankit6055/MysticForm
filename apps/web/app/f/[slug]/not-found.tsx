import Link from "next/link";
import { AlertCircle } from "lucide-react";

export default function FormNotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#f5f2ec] px-6 text-center">
      <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#f0ebe0]">
        <AlertCircle className="h-7 w-7 text-[#7a7060]" />
      </div>
      <h1 className="text-2xl font-semibold text-[#1a1812]">Form not available</h1>
      <p className="mt-3 max-w-xs text-sm leading-relaxed text-[#7a7060]">
        This form doesn&apos;t exist or has been removed by its creator.
      </p>
      <div className="mt-8 flex flex-col items-center gap-3">
        <Link
          href="/explore"
          className="rounded-xl bg-[#0f0e0b] px-6 py-2.5 text-sm font-semibold text-[#f4c95d] transition-opacity hover:opacity-90"
        >
          Explore other forms
        </Link>
        <Link
          href="/"
          className="text-sm text-[#9a9080] underline underline-offset-2 hover:text-[#1a1812]"
        >
          ← Back to MysticForm
        </Link>
      </div>
    </div>
  );
}
