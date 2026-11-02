'use client';

import { useState, useRef } from 'react';
import { Upload, X, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { getErrorMessage } from '@/lib/utils/api';

export type UploadFolder = 'projects' | 'about' | 'achievements' | 'resumes';

interface ImageUploaderProps {
  folder: UploadFolder;
  onUpload: (url: string, key: string) => void;
  accept?: string;
  maxSize?: number;
  multiple?: boolean;
  disabled?: boolean;
}

export function ImageUploader({
  folder,
  onUpload,
  accept = 'image/*',
  maxSize = 10 * 1024 * 1024,
  multiple = false,
  disabled = false,
}: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const filesArray = Array.from(files);

    for (const file of filesArray) {
      if (file.size > maxSize) {
        toast.error(`${file.name} exceeds maximum size of ${maxSize / 1024 / 1024}MB`);
        continue;
      }
    }

    const previews = filesArray.map((file) => URL.createObjectURL(file));
    setPreviewUrls(previews);

    setUploading(true);

    try {
      for (const file of filesArray) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('folder', folder);

        const response = await fetch('/api/v1/admin/upload', {
          method: 'POST',
          body: formData,
        });

        const data = await response.json();

        if (!data.success) {
          throw new Error(data.error || 'Upload failed');
        }

        onUpload(data.data.url, data.data.key);
        toast.success(`${file.name} uploaded successfully`);
      }

      setPreviewUrls([]);
      if (inputRef.current) {
        inputRef.current.value = '';
      }
    } catch (error) {
      toast.error(getErrorMessage(error, 'Upload failed'));
    } finally {
      setUploading(false);
    }
  };

  const handleDrag = (e: import('react').DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: import('react').DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (disabled || uploading) return;

    handleFiles(e.dataTransfer.files);
  };

  const handleChange = (e: import('react').ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (disabled || uploading) return;
    handleFiles(e.target.files);
  };

  const clearPreviews = () => {
    previewUrls.forEach((url) => URL.revokeObjectURL(url));
    setPreviewUrls([]);
  };

  return (
    <div className="w-full">
      <div
        className={cn(
          'relative rounded-[var(--radius-container)] border-2 border-dashed p-8',
          'transition-all duration-300',
          'bg-[var(--bg-elevated)]',
          dragActive
            ? 'border-[var(--teal)] bg-[var(--teal)]/5'
            : 'border-[var(--text-secondary)]/30 hover:border-[var(--teal)]/50',
          (disabled || uploading) && 'opacity-50 cursor-not-allowed',
          !disabled && !uploading && 'cursor-pointer'
        )}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => !disabled && !uploading && inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          accept={accept}
          multiple={multiple}
          onChange={handleChange}
          disabled={disabled || uploading}
        />

        <div className="flex flex-col items-center justify-center gap-4">
          {uploading ? (
            <>
              <Loader2 className="h-12 w-12 animate-spin text-[var(--teal)]" />
              <p className="text-[var(--text-primary)] font-medium">Uploading...</p>
            </>
          ) : (
            <>
              <div
                className={cn(
                  'rounded-full p-4',
                  'bg-[var(--bg-elevated)]',
                  'shadow-surface-raised'
                )}
              >
                <Upload className="h-8 w-8 text-[var(--teal)]" />
              </div>
              <div className="text-center">
                <p className="text-[var(--text-primary)] font-medium mb-1">
                  {multiple ? 'Upload images' : 'Upload image'}
                </p>
                <p className="text-[var(--text-secondary)] text-sm">Drag and drop or click to browse</p>
                <p className="text-[var(--text-secondary)] text-xs mt-1">Max size: {maxSize / 1024 / 1024}MB</p>
              </div>
            </>
          )}
        </div>

        {previewUrls.length > 0 && (
          <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2">
            {previewUrls.map((url, index) => (
              <div key={index} className="relative aspect-square rounded-lg overflow-hidden">
                <img
                  src={url}
                  alt={`Preview ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {previewUrls.length > 0 && !uploading && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            clearPreviews();
          }}
          className="mt-2"
        >
          <X className="h-4 w-4 mr-2" />
          Clear previews
        </Button>
      )}
    </div>
  );
}
