import { Settings, ShieldCheck } from "lucide-react";
import { api } from "~/trpc/server";
import { SignOutButton } from "~/components/sign-out-button";

export default async function DashboardSettingsPage() {
  const user = await api.auth.me.query();

  return (
    <div className="min-h-full bg-[#f5f2ec] px-6 py-8 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <div className="mb-8">
          <div className="mb-2 flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#0f0e0b]">
              <Settings className="h-4 w-4 text-[#f4c95d]" />
            </div>
            <h1 className="text-xl font-semibold tracking-tight text-[#1a1812]">Workspace settings</h1>
          </div>
          <p className="text-sm text-[#7a7060]">
            Account details for this MysticForm workspace.
          </p>
        </div>

        <section className="overflow-hidden rounded-2xl border border-[#e8e0d4] bg-[#faf9f6]">
          <div className="border-b border-[#e8e0d4] px-6 py-4">
            <div className="flex items-center gap-2.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#f0ebe0]">
                <ShieldCheck className="h-3.5 w-3.5 text-[#7a7060]" />
              </div>
              <h2 className="text-sm font-semibold text-[#1a1812]">Signed-in account</h2>
            </div>
          </div>
          <div className="space-y-5 px-6 py-5">
            <div className="flex flex-col gap-1.5 sm:flex-row sm:items-start sm:gap-8">
              <div className="sm:w-44 sm:shrink-0 sm:pt-2">
                <p className="text-sm font-medium text-[#1a1812]">Name</p>
              </div>
              <p className="rounded-lg border border-[#e8e0d4] bg-white px-3 py-2 text-sm text-[#3a3428]">
                {user?.fullName}
              </p>
            </div>
            <div className="flex flex-col gap-1.5 sm:flex-row sm:items-start sm:gap-8">
              <div className="sm:w-44 sm:shrink-0 sm:pt-2">
                <p className="text-sm font-medium text-[#1a1812]">Email</p>
              </div>
              <p className="rounded-lg border border-[#e8e0d4] bg-white px-3 py-2 text-sm text-[#3a3428]">
                {user?.email}
              </p>
            </div>
          </div>
          <div className="flex justify-end border-t border-[#e8e0d4] bg-[#f5f2ec]/60 px-6 py-3">
            <SignOutButton className="text-[#7a7060] hover:text-[#1a1812]" />
          </div>
        </section>
      </div>
    </div>
  );
}
