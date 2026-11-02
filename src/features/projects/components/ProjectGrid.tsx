import { ProjectCard } from './ProjectCard';
import { ProjectTable } from './ProjectTable';
import type { Project } from '../types/projects.types';

interface ProjectGridProps {
  projects: Project[];
  viewMode: 'grid' | 'table';
  onEdit: (id: string) => void;
  onDelete: (project: Project) => void;
  onToggleVisibility: (project: Project) => void;
  onToggleFeatured: (project: Project) => void;
}

export function ProjectGrid({
  projects,
  viewMode,
  onEdit,
  onDelete,
  onToggleVisibility,
  onToggleFeatured,
}: ProjectGridProps) {
  return viewMode === 'grid' ? (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {projects.map((project, index) => (
        <ProjectCard
          key={project.id}
          project={project}
          index={index}
          onEdit={() => onEdit(project.id)}
          onDelete={() => onDelete(project)}
          onToggleVisibility={() => onToggleVisibility(project)}
          onToggleFeatured={() => onToggleFeatured(project)}
        />
      ))}
    </div>
  ) : (
    <ProjectTable
      projects={projects}
      onEdit={(project) => onEdit(project.id)}
      onDelete={onDelete}
      onToggleVisibility={onToggleVisibility}
      onToggleFeatured={onToggleFeatured}
    />
  );
}
