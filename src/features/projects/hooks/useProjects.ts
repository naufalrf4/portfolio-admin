'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { getErrorMessage } from '@/lib/utils/api';
import type { Project } from '../types/projects.types';

export function useProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();

    async function fetchProjects() {
      try {
        const response = await fetch('/api/v1/admin/projects', {
          signal: controller.signal,
        });
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error?.message || 'Failed to load projects');
        }

        if (data.success && data.data?.projects && Array.isArray(data.data.projects)) {
          setProjects(data.data.projects);
        } else {
          setProjects([]);
        }
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          toast.error(getErrorMessage(error, 'Failed to load projects'));
          setProjects([]);
        }
      } finally {
        setLoading(false);
      }
    }

    fetchProjects();

    return () => {
      controller.abort();
    };
  }, []);

  async function refreshProjects() {
    try {
      const response = await fetch('/api/v1/admin/projects');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || 'Failed to load projects');
      }

      if (data.success && data.data?.projects && Array.isArray(data.data.projects)) {
        setProjects(data.data.projects);
      }
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to refresh projects'));
    }
  }

  async function toggleVisibility(project: Project) {
    try {
      const response = await fetch(`/api/v1/admin/projects/${project.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ visible: !project.visible }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success(`Project ${!project.visible ? 'shown' : 'hidden'}`);
        await refreshProjects();
      }
    } catch {
      toast.error('Failed to update visibility');
    }
  }

  async function toggleFeatured(project: Project) {
    try {
      const response = await fetch(`/api/v1/admin/projects/${project.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ featured: !project.featured }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success(`Project ${!project.featured ? 'featured' : 'unfeatured'}`);
        await refreshProjects();
      }
    } catch {
      toast.error('Failed to update featured status');
    }
  }

  async function deleteProject(project: Project) {
    try {
      const response = await fetch(`/api/v1/admin/projects/${project.id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Project deleted successfully');
        await refreshProjects();
        return true;
      } else {
        const errorMsg =
          typeof data.error === 'string'
            ? data.error
            : data.error?.message || 'Failed to delete project';
        toast.error(errorMsg);
        return false;
      }
    } catch {
      toast.error('Failed to delete project');
      return false;
    }
  }

  return {
    projects,
    loading,
    refreshProjects,
    toggleVisibility,
    toggleFeatured,
    deleteProject,
  };
}
