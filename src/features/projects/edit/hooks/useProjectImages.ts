'use client';

import { useCallback, useState } from 'react';
import { toast } from 'sonner';
import { getErrorMessage } from '@/lib/utils/api';
import type { ProjectImage } from '../types';

export function useProjectImages(projectId: string) {
  const [images, setImages] = useState<ProjectImage[]>([]);

  const fetchImages = useCallback(async () => {
    try {
      const response = await fetch(`/api/v1/admin/projects/${projectId}/images`);
      const data = await response.json();

      if (data.success) {
        setImages(data.data);
      }
    } catch {
      toast.error('Failed to load images');
    }
  }, [projectId]);

  const handleImageUpload = useCallback(
    async (url: string, key: string) => {
      try {
        const response = await fetch(`/api/v1/admin/projects/${projectId}/images`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url, key }),
        });

        const data = await response.json();

        if (!data.success) {
          const errorMsg =
            typeof data.error === 'string'
              ? data.error
              : data.error?.message || 'Failed to add image';
          throw new Error(errorMsg);
        }

        await fetchImages();
      } catch (error) {
        toast.error(getErrorMessage(error, 'Failed to add image'));
      }
    },
    [fetchImages, projectId]
  );

  return {
    images,
    fetchImages,
    handleImageUpload,
  };
}
