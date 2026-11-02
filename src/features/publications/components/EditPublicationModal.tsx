'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createBlogLinkSchema, type CreateBlogLinkInput } from '@/lib/validations/blog-link.schema';
import { ResponsiveModal } from '@/components/ui/responsive-modal';
import { Button } from '@/components/ui/button';
import { INPUT_CLASS_NAME, INPUT_STYLE, SURFACE_STYLES } from '../constants/publications.constants';
import type { PublicationLink } from '../types/publications.types';

interface EditPublicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateBlogLinkInput) => Promise<void>;
  publicationLink: PublicationLink | null;
}

export function EditPublicationModal({ isOpen, onClose, onSubmit, publicationLink }: EditPublicationModalProps) {
  const form = useForm<CreateBlogLinkInput>({
    resolver: zodResolver(createBlogLinkSchema as never) as never,
  });

  useEffect(() => {
    if (publicationLink) {
      const publishedDate = publicationLink.publishedAt
        ? new Date(publicationLink.publishedAt).toISOString().split('T')[0]
        : '';

      form.reset({
        url: publicationLink.url,
        title: publicationLink.title,
        description: publicationLink.description || '',
        imageUrl: publicationLink.imageUrl || '',
        source: publicationLink.source,
        publishedAt: publishedDate,
      });
    }
  }, [publicationLink, form]);

  async function handleSubmit(data: CreateBlogLinkInput) {
    await onSubmit(data);
    form.reset();
  }

  function handleClose() {
    onClose();
    form.reset();
  }

  return (
    <ResponsiveModal
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) handleClose();
      }}
      title="Edit Publication Link"
      description="Update the publication information."
      size="lg"
      footer={
        <>
          <Button type="button" variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={form.formState.isSubmitting}
            form="edit-publication-form"
          >
            {form.formState.isSubmitting ? 'Updating...' : 'Update Link'}
          </Button>
        </>
      }
    >
      <form id="edit-publication-form" onSubmit={form.handleSubmit(handleSubmit)} className="space-y-5">
        <div className="space-y-2">
          <label
            htmlFor="edit-url"
            className="block text-sm font-semibold"
            style={{ color: SURFACE_STYLES.foreground }}
          >
            URL <span style={{ color: SURFACE_STYLES.accent }}>*</span>
          </label>
          <input
            id="edit-url"
            type="url"
            placeholder="https://example.com/publication/article"
            className={INPUT_CLASS_NAME}
            style={INPUT_STYLE}
            {...form.register('url')}
          />
          {form.formState.errors.url && (
            <p className="text-sm text-red-500 pl-2">{form.formState.errors.url.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <label
            htmlFor="edit-title"
            className="block text-sm font-semibold"
            style={{ color: SURFACE_STYLES.foreground }}
          >
            Title <span style={{ color: SURFACE_STYLES.accent }}>*</span>
          </label>
          <input
            id="edit-title"
            type="text"
            placeholder="Article title"
            className={INPUT_CLASS_NAME}
            style={INPUT_STYLE}
            {...form.register('title')}
          />
          {form.formState.errors.title && (
            <p className="text-sm text-red-500 pl-2">{form.formState.errors.title.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <label
            htmlFor="edit-source"
            className="block text-sm font-semibold"
            style={{ color: SURFACE_STYLES.foreground }}
          >
            Source <span style={{ color: SURFACE_STYLES.accent }}>*</span>
          </label>
          <input
            id="edit-source"
            type="text"
            placeholder="Medium, Dev.to, Personal Publication, etc."
            className={INPUT_CLASS_NAME}
            style={INPUT_STYLE}
            {...form.register('source')}
          />
          {form.formState.errors.source && (
            <p className="text-sm text-red-500 pl-2">{form.formState.errors.source.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <label
            htmlFor="edit-description"
            className="block text-sm font-semibold"
            style={{ color: SURFACE_STYLES.foreground }}
          >
            Description
          </label>
          <textarea
            id="edit-description"
            placeholder="Brief description of the article"
            rows={3}
            className={`${INPUT_CLASS_NAME} resize-none`}
            style={INPUT_STYLE}
            {...form.register('description')}
          />
        </div>

        <div className="space-y-2">
          <label
            htmlFor="edit-imageUrl"
            className="block text-sm font-semibold"
            style={{ color: SURFACE_STYLES.foreground }}
          >
            Image URL
          </label>
          <input
            id="edit-imageUrl"
            type="url"
            placeholder="https://example.com/image.jpg"
            className={INPUT_CLASS_NAME}
            style={INPUT_STYLE}
            {...form.register('imageUrl')}
          />
        </div>

        <div className="space-y-2">
          <label
            htmlFor="edit-publishedAt"
            className="block text-sm font-semibold"
            style={{ color: SURFACE_STYLES.foreground }}
          >
            Published Date
          </label>
          <input
            id="edit-publishedAt"
            type="date"
            className={INPUT_CLASS_NAME}
            style={INPUT_STYLE}
            {...form.register('publishedAt')}
          />
        </div>
      </form>
    </ResponsiveModal>
  );
}
