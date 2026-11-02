import type { Metadata } from 'next';
import { ProjectsPageContent } from './components/ProjectsPageContent';

export const metadata: Metadata = {
  title: 'Projects',
  description: 'Manage your portfolio projects - create, edit, and organize your work',
};

export default function ProjectsPage() {
  return <ProjectsPageContent />;
}
