'use client';

import { useEffect, useState } from 'react';
import { FolderKanban, Loader2, Settings } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PageHeader } from '@/components/layout/PageHeader';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { ProjectModal } from '@/components/projects/ProjectModal';
import { useProjectEdit, useProjectImages, ImageTab, ContentTab } from '@/features/projects/edit';

interface ProjectEditPageContentProps {
  projectId: string;
}

export function ProjectEditPageContent({ projectId }: ProjectEditPageContentProps) {
  const [activeTab, setActiveTab] = useState('images');
  const [isMetadataModalOpen, setIsMetadataModalOpen] = useState(false);
  const { project, loading, content, setContent, saving, debouncedContent, fetchProject } =
    useProjectEdit(projectId);
  const { images, fetchImages, handleImageUpload } = useProjectImages(projectId);

  useEffect(() => {
    if (project?.id) {
      void fetchImages();
    }
  }, [fetchImages, project?.id]);

  if (loading)
    return (
      <PageWrapper>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-[var(--teal)]" />
        </div>
      </PageWrapper>
    );

  if (!project) return null;

  return (
    <PageWrapper>
      <PageHeader
        title={`Editing: ${project.title}`}
        description="Manage images and content for this project"
        icon={<FolderKanban />}
        back={{ href: '/projects', label: 'Back to Projects' }}
      />

      <div className="mt-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="flex items-center justify-between mb-6">
            <TabsList>
              <TabsTrigger value="images">Images</TabsTrigger>
              <TabsTrigger value="content">Content</TabsTrigger>
            </TabsList>
            <button
              onClick={() => setIsMetadataModalOpen(true)}
              className="p-2 rounded-xl bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:text-[var(--teal)] shadow-surface-raised-sm hover:shadow-surface-sunken-sm transition-all"
              title="Edit Metadata"
            >
              <Settings className="h-5 w-5" />
            </button>
          </div>

          <TabsContent value="images">
            <ImageTab
              projectId={project.id}
              images={images}
              onImageUpload={handleImageUpload}
              onUpdate={fetchImages}
            />
          </TabsContent>

          <TabsContent value="content">
            <ContentTab
              content={content}
              onContentChange={setContent}
              saving={saving}
              debouncedContent={debouncedContent}
              project={project}
            />
          </TabsContent>
        </Tabs>
      </div>

      <ProjectModal
        isOpen={isMetadataModalOpen}
        onClose={() => setIsMetadataModalOpen(false)}
        onSuccess={() => {
          setIsMetadataModalOpen(false);
          fetchProject();
        }}
        project={project}
      />
    </PageWrapper>
  );
}
