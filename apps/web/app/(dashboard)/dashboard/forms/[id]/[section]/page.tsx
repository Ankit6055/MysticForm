import { redirect } from "next/navigation";

interface LegacyDashboardFormSectionPageProps {
  params: Promise<{ id: string; section: string }>;
}

export default async function LegacyDashboardFormSectionPage({
  params,
}: LegacyDashboardFormSectionPageProps) {
  const { id, section } = await params;
  redirect(`/forms/${id}/${section}`);
}
