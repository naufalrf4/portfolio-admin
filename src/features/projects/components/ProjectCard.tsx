import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Star, Pencil, Trash2, Wrench, ExternalLink, Github, Hash, Image as ImageIcon } from './Icons';
import { Switch } from '@/components/ui/switch';
import { getPlatformFromUrl } from '@/features/shared/utils';
import { truncateUrl } from '@/lib/utils/string';
import type { ProjectCardProps } from '../types/projects.types';

export function ProjectCard({
  project,
  index,
  onEdit,
  onDelete,
  onToggleVisibility,
  onToggleFeatured,
}: ProjectCardProps) {
  const imageUrl =
    project.imageUrl ||
    (project.images && project.images.length > 0
      ? project.images[0].url
      : null);

  return (
    <TooltipProvider>
      <div
        className="group relative rounded-[var(--radius-container)] p-6 bg-[var(--bg-elevated)] transition-all duration-300 hover:-translate-y-1 shadow-surface-raised"
        style={{
          animationDelay: `${index * 50}ms`,
        }}
      >
        <div className="mb-4 rounded-2xl overflow-hidden shadow-surface-sunken-sm">
          {imageUrl ? (
            <img src={imageUrl} alt={project.title} className="w-full h-40 object-cover" />
          ) : (
            <div className="w-full h-40 flex items-center justify-center bg-[var(--bg-elevated)]">
              <ImageIcon className="h-8 w-8 text-[var(--text-secondary)]" />
            </div>
          )}
        </div>
        <div className="flex items-center justify-end mb-4">
          <div className="flex items-center gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={onEdit}
                  className="p-2 rounded-xl bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:text-[var(--teal)] transition-all duration-200 hover:shadow-surface-raised-sm"
                >
                  <Pencil className="h-4 w-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent>Edit</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={onDelete}
                  className="p-2 rounded-xl bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:text-red-500 transition-all duration-200 hover:shadow-surface-raised-sm"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent>Delete</TooltipContent>
            </Tooltip>
          </div>
        </div>

        <div className="mb-3">
          <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-1">{project.title}</h3>
          <p className="text-sm text-[var(--text-secondary)]">{project.category}</p>
        </div>

        <p className="text-sm text-[var(--text-secondary)] mb-4 line-clamp-2">{project.summary}</p>

        {project.techStack.length > 0 && (
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <Wrench className="h-4 w-4 text-[var(--text-secondary)]" />
              <span className="text-xs font-medium text-[var(--text-secondary)]">Tech Stack</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {project.techStack.slice(0, 3).map((tech) => (
                <span
                  key={tech}
                  className="px-3 py-1 text-xs rounded-full bg-[var(--bg-elevated)] text-[var(--text-primary)] shadow-surface-raised-sm"
                >
                  {tech}
                </span>
              ))}
              {project.techStack.length > 3 && (
                <span className="px-3 py-1 text-xs rounded-full text-[var(--text-secondary)]">
                  +{project.techStack.length - 3}
                </span>
              )}
            </div>
          </div>
        )}

        {(project.liveUrl || project.repoUrl) && (
          <div className="mb-4 space-y-2">
            {project.liveUrl && (
              <a
                href={project.liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-xs hover:underline truncate"
                style={{ color: getPlatformFromUrl(project.liveUrl).color }}
              >
                <ExternalLink className="h-4 w-4 flex-shrink-0" />
                <span className="truncate">{truncateUrl(project.liveUrl)}</span>
              </a>
            )}
            {project.repoUrl && (
              <a
                href={project.repoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-xs hover:underline truncate"
                style={{ color: getPlatformFromUrl(project.repoUrl).color }}
              >
                <Github className="h-4 w-4 flex-shrink-0" />
                <span className="truncate">{truncateUrl(project.repoUrl)}</span>
              </a>
            )}
          </div>
        )}

        <div className="flex items-center justify-between pt-4 border-t border-line/20">
          <div className="flex items-center gap-2">
            <Switch
              checked={project.visible}
              onCheckedChange={onToggleVisibility}
              aria-label={project.visible ? 'Hide project' : 'Show project'}
            />
            <span className="text-xs text-[var(--text-secondary)]">
              {project.visible ? 'Visible' : 'Hidden'}
            </span>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={onToggleFeatured}
                  className={`p-2 rounded-xl transition-colors ${
                    project.featured ? 'text-[var(--amber)]' : 'text-[var(--text-secondary)]'
                  }`}
                >
                  <Star className="h-4 w-4" fill={project.featured ? 'currentColor' : 'none'} />
                </button>
              </TooltipTrigger>
              <TooltipContent>{project.featured ? 'Featured' : 'Not Featured'}</TooltipContent>
            </Tooltip>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)]">
            <Hash className="h-4 w-4" />
            <span>{project.order}</span>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
