import { Eye, EyeOff, Star, Pencil, Trash2 } from './Icons';
import { SURFACE_STYLES } from '../constants/projects.constants';
import type { ProjectTableProps } from '../types/projects.types';

export function ProjectTable({
  projects,
  onEdit,
  onDelete,
  onToggleVisibility,
  onToggleFeatured,
}: ProjectTableProps) {
  return (
    <div
      className="rounded-[var(--radius-container)] overflow-hidden bg-[var(--bg-elevated)]"
      style={{
        boxShadow: SURFACE_STYLES.shadows.extruded,
      }}
    >
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-line/20">
              <th className="px-6 py-4 text-left text-sm font-semibold text-[var(--text-primary)]">Project</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-[var(--text-primary)]">Category</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-[var(--text-primary)]">
                Tech Stack
              </th>
              <th className="px-6 py-4 text-center text-sm font-semibold text-[var(--text-primary)]">Status</th>
              <th className="px-6 py-4 text-center text-sm font-semibold text-[var(--text-primary)]">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {projects.map((project) => (
              <tr key={project.id} className="border-b border-line/10 last:border-0">
                <td className="px-6 py-4">
                  <div>
                    <p className="font-medium text-[var(--text-primary)]">{project.title}</p>
                    <p className="text-sm text-[var(--text-secondary)] line-clamp-1">{project.summary}</p>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-[var(--text-secondary)]">{project.category}</td>
                <td className="px-6 py-4">
                  <div className="flex flex-wrap gap-1">
                    {project.techStack.slice(0, 2).map((tech) => (
                      <span
                        key={tech}
                        className="px-2 py-1 text-xs rounded-full bg-[var(--bg-elevated)] text-[var(--text-primary)]"
                        style={{
                          boxShadow: SURFACE_STYLES.shadows.insetTiny,
                        }}
                      >
                        {tech}
                      </span>
                    ))}
                    {project.techStack.length > 2 && (
                      <span className="text-xs text-[var(--text-secondary)]">
                        +{project.techStack.length - 2}
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-center gap-2">
                    <button onClick={() => onToggleVisibility(project)}>
                      {project.visible ? (
                        <Eye className="h-4 w-4 text-[var(--teal)]" />
                      ) : (
                        <EyeOff className="h-4 w-4 text-[var(--text-secondary)]" />
                      )}
                    </button>
                    <button onClick={() => onToggleFeatured(project)}>
                      <Star
                        className="h-4 w-4"
                        fill={project.featured ? 'var(--amber)' : 'none'}
                        stroke={project.featured ? 'var(--amber)' : 'var(--text-secondary)'}
                      />
                    </button>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-center gap-2">
                    <button
                      onClick={() => onEdit(project)}
                      className="p-2 rounded-xl bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:text-[var(--teal)] transition-colors"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => onDelete(project)}
                      className="p-2 rounded-xl bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
