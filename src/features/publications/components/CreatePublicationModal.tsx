'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createBlogLinkSchema, type CreateBlogLinkInput } from '@/lib/validations/blog-link.schema';
import { ResponsiveModal } from '@/components/ui/responsive-modal';
import { Button } from '@/components/ui/button';
import { INPUT_CLASS_NAME, INPUT_STYLE, SURFACE_STYLES } from '../constants/publications.constants';

interface CreatePublicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateBlogLinkInput) => Promise<void>;
}

export function CreatePublicationModal({ isOpen, onClose, onSubmit }: CreatePublicationModalProps) {
  const form = useForm<CreateBlogLinkInput>({
    resolver: zodResolver(createBlogLinkSchema as never) as never,
    defaultValues: {
      url: '',
      title: '',
      source: '',
      description: '',
      imageUrl: '',
      publishedAt: '',
    },
  });

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
      title="Add New Publication Link"
      description="Add a new external publication to your portfolio."
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
            form="create-publication-form"
          >
            {form.formState.isSubmitting ? 'Creating...' : 'Create Link'}
          </Button>
        </>
      }
    >
      <form id="create-publication-form" onSubmit={form.handleSubmit(handleSubmit)} className="space-y-5">
        <div className="space-y-2">
          <label
            htmlFor="url"
            className="block text-sm font-semibold"
            style={{ color: SURFACE_STYLES.foreground }}
          >
            URL <span style={{ color: SURFACE_STYLES.accent }}>*</span>
          </label>
          <input
            id="url"
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
            htmlFor="title"
            className="block text-sm font-semibold"
            style={{ color: SURFACE_STYLES.foreground }}
          >
            Title <span style={{ color: SURFACE_STYLES.accent }}>*</span>
          </label>
          <input
            id="title"
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
            htmlFor="source"
            className="block text-sm font-semibold"
            style={{ color: SURFACE_STYLES.foreground }}
          >
            Source <span style={{ color: SURFACE_STYLES.accent }}>*</span>
          </label>
          <input
            id="source"
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
            htmlFor="description"
            className="block text-sm font-semibold"
            style={{ color: SURFACE_STYLES.foreground }}
          >
            Description
          </label>
          <textarea
            id="description"
            placeholder="Brief description of the article"
            rows={3}
            className={`${INPUT_CLASS_NAME} resize-none`}
            style={INPUT_STYLE}
            {...form.register('description')}
          />
        </div>

        <div className="space-y-2">
          <label
            htmlFor="imageUrl"
            className="block text-sm font-semibold"
            style={{ color: SURFACE_STYLES.foreground }}
          >
            Image URL
          </label>
          <input
            id="imageUrl"
            type="url"
            placeholder="https://example.com/image.jpg"
            className={INPUT_CLASS_NAME}
            style={INPUT_STYLE}
            {...form.register('imageUrl')}
          />
        </div>

        <div className="space-y-2">
          <label
            htmlFor="publishedAt"
            className="block text-sm font-semibold"
            style={{ color: SURFACE_STYLES.foreground }}
          >
            Published Date
          </label>
          <input
            id="publishedAt"
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
