export interface Project {
  id: string;
  title: string;
  slug: string;
  summary: string;
  description: string | null;
  category: string;
  techStack: string[];
  imageUrl?: string | null;
  images?: Array<{ url: string }>;
  liveUrl: string | null;
  repoUrl: string | null;
  featured: boolean;
  visible: boolean;
  order: number;
}

export type ViewMode = 'grid' | 'table';

export type FilterMode = 'all' | 'visible' | 'hidden' | 'featured';

export interface ProjectCardProps {
  project: Project;
  index: number;
  onEdit: () => void;
  onDelete: () => void;
  onToggleVisibility: () => void;
  onToggleFeatured: () => void;
}

export interface ProjectTableProps {
  projects: Project[];
  onEdit: (project: Project) => void;
  onDelete: (project: Project) => void;
  onToggleVisibility: (project: Project) => void;
  onToggleFeatured: (project: Project) => void;
}
