import { Globe, Smartphone, Server, Cloud, Code2 } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export function getCategoryIcon(category: string): LucideIcon {
  const lowerCategory = category.toLowerCase();
  if (lowerCategory.includes('web')) {
    return Globe;
  } else if (lowerCategory.includes('mobile')) {
    return Smartphone;
  } else if (lowerCategory.includes('backend') || lowerCategory.includes('api')) {
    return Server;
  } else if (lowerCategory.includes('devops') || lowerCategory.includes('infrastructure')) {
    return Cloud;
  }
  return Code2;
}

export function filterProjects<T extends { visible: boolean; featured: boolean }>(
  projects: T[],
  mode: 'all' | 'visible' | 'hidden' | 'featured'
): T[] {
  if (mode === 'visible') return projects.filter((p) => p.visible);
  if (mode === 'hidden') return projects.filter((p) => !p.visible);
  if (mode === 'featured') return projects.filter((p) => p.featured);
  return projects;
}

export function searchProjects<T extends { title: string; category: string; techStack: string[] }>(
  projects: T[],
  query: string
): T[] {
  if (!query.trim()) return projects;
  const lowerQuery = query.toLowerCase();
  return projects.filter(
    (project) =>
      project.title.toLowerCase().includes(lowerQuery) ||
      project.category.toLowerCase().includes(lowerQuery) ||
      project.techStack.some((tech) => tech.toLowerCase().includes(lowerQuery))
  );
}
