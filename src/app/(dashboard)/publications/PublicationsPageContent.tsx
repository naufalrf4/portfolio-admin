'use client';

import { Link } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { FloatingActionButton } from '@/components/layout/FloatingActionButton';
import {
  usePublications,
  PublicationCard,
  CreatePublicationModal,
  EditPublicationModal,
  DeleteConfirmModal,
  PlusIcon,
  PublicationLinkIcon,
  SURFACE_STYLES,
  FILTER_BUTTONS,
} from '@/features/publications';

export function PublicationsPageContent() {
  const {
    filteredPublicationLinks,
    loading,
    filter,
    setFilter,
    toggleVisibility,
    createPublicationLink,
    updatePublicationLink,
    deletePublicationLink,
    publicationLinks,
    isCreateModalOpen,
    setIsCreateModalOpen,
    isEditModalOpen,
    isDeleteModalOpen,
    editingPublicationLink,
    deletingPublicationLink,
    isDeleting,
    openEditModal,
    openDeleteModal,
    closeCreateModal,
    closeEditModal,
    closeDeleteModal,
  } = usePublications();

  if (loading) {
    return null;
  }

  return (
    <PageWrapper>
      <PageHeader
        title="Publication Links"
        description="Manage your external publications"
        icon={<Link />}
        stats={[
          { label: 'Total', value: publicationLinks.length },
          {
            label: 'Visible',
            value: publicationLinks.filter((b) => b.visible).length,
            variant: 'success',
          },
          {
            label: 'Hidden',
            value: publicationLinks.filter((b) => !b.visible).length,
            variant: 'default',
          },
        ]}
        actions={
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-2 px-6 py-3 rounded-2xl font-semibold transition-all duration-200 hover:scale-105 hover:-translate-y-0.5"
            style={{
              background: SURFACE_STYLES.accent,
              boxShadow: SURFACE_STYLES.shadows.small,
              color: SURFACE_STYLES.accentForeground,
            }}
          >
            <PlusIcon />
            <span>Add Link</span>
          </button>
        }
      />

      <div
        className="rounded-2xl p-2 mb-8 inline-flex gap-2"
        style={{
          backgroundColor: SURFACE_STYLES.background,
          boxShadow: SURFACE_STYLES.shadows.inset,
        }}
      >
        {FILTER_BUTTONS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className="px-5 py-2 rounded-xl font-medium transition-all duration-200"
            style={{
              backgroundColor: filter === key ? SURFACE_STYLES.background : 'transparent',
              boxShadow: filter === key ? SURFACE_STYLES.shadows.small : 'none',
              color: filter === key ? SURFACE_STYLES.accent : SURFACE_STYLES.muted,
            }}
          >
            {label}
            {key === 'all' && ` (${publicationLinks.length})`}
            {key === 'visible' && ` (${publicationLinks.filter((b) => b.visible).length})`}
            {key === 'hidden' && ` (${publicationLinks.filter((b) => !b.visible).length})`}
          </button>
        ))}
      </div>

      {filteredPublicationLinks.length === 0 ? (
        <div
          className="rounded-[var(--radius-container)] p-12 text-center"
          style={{
            backgroundColor: SURFACE_STYLES.background,
            boxShadow: SURFACE_STYLES.shadows.extruded,
          }}
        >
          <div
            className="mx-auto w-20 h-20 rounded-2xl flex items-center justify-center mb-6"
            style={{
              background: 'var(--teal)',
              boxShadow: SURFACE_STYLES.shadows.small,
            }}
          >
            <span className="text-on-accent">
              <PublicationLinkIcon />
            </span>
          </div>
          <h3
            className="font-display text-xl font-bold mb-2"
            style={{ color: SURFACE_STYLES.foreground }}
          >
            {filter === 'all' ? 'No publication links yet' : `No ${filter} publication links`}
          </h3>
          <p className="mb-6" style={{ color: SURFACE_STYLES.muted }}>
            {filter === 'all'
              ? 'Create your first publication link to showcase your work.'
              : `You don't have any ${filter} publication links at the moment.`}
          </p>
          {filter === 'all' && (
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl font-semibold transition-all duration-200 hover:scale-105"
              style={{
                background: SURFACE_STYLES.accent,
                boxShadow: SURFACE_STYLES.shadows.small,
                color: SURFACE_STYLES.accentForeground,
              }}
            >
              <PlusIcon />
              <span>Add Your First Link</span>
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPublicationLinks.map((publicationLink) => (
            <PublicationCard
              key={publicationLink.id}
              publicationLink={publicationLink}
              onEdit={() => openEditModal(publicationLink)}
              onDelete={() => openDeleteModal(publicationLink)}
              onToggleVisibility={() => toggleVisibility(publicationLink.id, publicationLink.visible)}
            />
          ))}
        </div>
      )}

      <CreatePublicationModal
        isOpen={isCreateModalOpen}
        onClose={closeCreateModal}
        onSubmit={async (data) => {
          await createPublicationLink(data);
        }}
      />

      <EditPublicationModal
        isOpen={isEditModalOpen}
        onClose={closeEditModal}
        onSubmit={async (data) => {
          if (editingPublicationLink) {
            await updatePublicationLink(editingPublicationLink.id, data);
          }
        }}
        publicationLink={editingPublicationLink}
      />

      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={closeDeleteModal}
        onConfirm={() => {
          if (deletingPublicationLink) {
            deletePublicationLink(deletingPublicationLink.id);
          }
        }}
        title={deletingPublicationLink?.title || ''}
        isDeleting={isDeleting}
      />

      <FloatingActionButton onClick={() => setIsCreateModalOpen(true)} label="Add Publication Link" />
    </PageWrapper>
  );
}
