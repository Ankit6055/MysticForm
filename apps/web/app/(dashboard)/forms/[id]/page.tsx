import { redirect } from "next/navigation";

interface FormPageProps {
  params: Promise<{ id: string }>;
}

export default async function FormPage({ params }: FormPageProps) {
  const { id } = await params;
  redirect(`/dashboard/forms/${id}/edit`);
}
