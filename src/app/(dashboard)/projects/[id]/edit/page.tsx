import type { Metadata } from 'next';
import { ProjectEditPageContent } from './components/ProjectEditPageContent';

type PageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;

  return {
    title: `Edit Project - ${id}`,
    description: 'Edit project content, images, and metadata',
  };
}

export default async function ProjectEditPage({ params }: PageProps) {
  const { id } = await params;

  return <ProjectEditPageContent projectId={id} />;
}
