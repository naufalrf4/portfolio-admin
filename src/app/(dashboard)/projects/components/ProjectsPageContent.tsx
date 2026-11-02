'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FolderKanban } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { FloatingActionButton } from '@/components/layout/FloatingActionButton';
import { ProjectModal } from '@/components/projects/ProjectModal';
import {
  useProjects,
  useProjectFilters,
  ProjectGrid,
  ProjectFilters,
  SkeletonCard,
  DeleteConfirmModal,
  EmptyState,
  type Project,
} from '@/features/projects';

export function ProjectsPageContent() {
  const router = useRouter();
  const { projects, loading, toggleVisibility, toggleFeatured, deleteProject, refreshProjects } =
    useProjects();
  const {
    viewMode,
    setViewMode,
    filterMode,
    setFilterMode,
    searchQuery,
    setSearchQuery,
    filteredProjects,
  } = useProjectFilters(projects);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingProject, setDeletingProject] = useState<Project | null>(null);
  const [deleting, setDeleting] = useState(false);

  const openDeleteModal = (project: Project) => {
    setDeletingProject(project);
    setIsDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    if (!deletingProject) return;
    setDeleting(true);
    try {
      if (await deleteProject(deletingProject)) setIsDeleteModalOpen(false);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <PageWrapper>
      <PageHeader
        title="Projects"
        description="Manage your portfolio projects"
        icon={<FolderKanban />}
        stats={[
          { label: 'Total', value: projects.length },
          { label: 'Visible', value: projects.filter((p) => p.visible).length },
          { label: 'Featured', value: projects.filter((p) => p.featured).length },
        ]}
        actions={
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-6 py-3 rounded-2xl font-semibold transition-all duration-200 hover:scale-105 bg-accent text-on-accent shadow-surface-raised-sm"
          >
            Add Project
          </button>
        }
      />

      <ProjectFilters
        filterMode={filterMode}
        setFilterMode={setFilterMode}
        viewMode={viewMode}
        setViewMode={setViewMode}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : filteredProjects.length === 0 ? (
        <EmptyState
          hasFilters={!!(searchQuery || filterMode !== 'all')}
          onCreate={() => setIsModalOpen(true)}
        />
      ) : (
        <ProjectGrid
          projects={filteredProjects}
          viewMode={viewMode}
          onEdit={(id) => router.push(`/projects/${id}/edit`)}
          onDelete={openDeleteModal}
          onToggleVisibility={toggleVisibility}
          onToggleFeatured={toggleFeatured}
        />
      )}

      <FloatingActionButton onClick={() => setIsModalOpen(true)} />

      <ProjectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => {
          setIsModalOpen(false);
          refreshProjects();
        }}
        project={null}
      />

      <DeleteConfirmModal
        open={isDeleteModalOpen}
        onOpenChange={setIsDeleteModalOpen}
        projectTitle={deletingProject?.title}
        onConfirm={handleDelete}
        deleting={deleting}
      />
    </PageWrapper>
  );
}
