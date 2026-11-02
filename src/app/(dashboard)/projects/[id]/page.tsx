import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

type PageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;

  return {
    title: `Project Details - ${id}`,
    description: 'Redirecting to the simplified project editor',
  };
}

export default async function ProjectDetailPage({ params }: PageProps) {
  const { id } = await params;
  redirect(`/projects/${id}/edit`);
}
