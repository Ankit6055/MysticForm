import { redirect } from "next/navigation";

interface LegacyDashboardFormPageProps {
  params: Promise<{ id: string }>;
}

export default async function LegacyDashboardFormPage({
  params,
}: LegacyDashboardFormPageProps) {
  const { id } = await params;
  redirect(`/forms/${id}`);
}
