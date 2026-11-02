'use client';

import { useState, useMemo } from 'react';
import type { Project, ViewMode, FilterMode } from '../types/projects.types';

export function useProjectFilters(projects: Project[]) {
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [filterMode, setFilterMode] = useState<FilterMode>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredProjects = useMemo(() => {
    return projects
      .filter((project) => {
        if (filterMode === 'visible') return project.visible;
        if (filterMode === 'hidden') return !project.visible;
        if (filterMode === 'featured') return project.featured;
        return true;
      })
      .filter((project) => {
        if (!searchQuery.trim()) return true;
        const query = searchQuery.toLowerCase();
        return (
          project.title.toLowerCase().includes(query) ||
          project.category.toLowerCase().includes(query) ||
          project.techStack.some((tech) => tech.toLowerCase().includes(query))
        );
      });
  }, [projects, filterMode, searchQuery]);

  return {
    viewMode,
    setViewMode,
    filterMode,
    setFilterMode,
    searchQuery,
    setSearchQuery,
    filteredProjects,
  };
}
