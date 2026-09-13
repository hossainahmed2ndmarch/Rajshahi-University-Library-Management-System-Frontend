import { redirect } from "next/navigation";

interface BlogRedirectProps {
  params: Promise<{ id: string }>;
}

export default async function BlogDetailRedirectPage({ params }: BlogRedirectProps) {
  const { id } = await params;
  redirect(`/publications/${id}`);
}
