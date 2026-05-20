import { redirect } from "next/navigation";
import { Suspense } from "react";
import { api } from "~/trpc/server";
import { FormsList } from "~/components/dashboard/forms-list";

export default async function DashboardPage() {
  let user;
  try {
    user = await api.auth.me.query();
  } catch {
    user = null;
  }

  if (!user) redirect("/login?next=/dashboard");

  return (
    <Suspense>
      <FormsList user={user} />
    </Suspense>
  );
}
