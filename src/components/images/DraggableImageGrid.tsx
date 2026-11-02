'use client';

import { useState } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Star, Trash2, GripVertical } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DeleteConfirmModal } from './DeleteConfirmModal';
import { toast } from 'sonner';

interface ProjectImage {
  id: string;
  url: string;
  caption?: string | null;
  alt?: string | null;
  order: number;
}

interface DraggableImageGridProps {
  images: ProjectImage[];
  projectId: string;
  onUpdate: () => void;
}

function SortableImage({
  image,
  isThumbnail,
  onDelete,
  onUpdateCaption,
  onUpdateAlt,
}: {
  image: ProjectImage;
  isThumbnail: boolean;
  onDelete: () => void;
  onUpdateCaption: (caption: string) => void;
  onUpdateAlt: (alt: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: image.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'group relative rounded-[16px] overflow-hidden',
        'bg-[var(--bg-elevated)]',
        'shadow-surface-raised',
        isDragging && 'opacity-50 z-50'
      )}
    >
      <div className="aspect-square relative">
        <img
          src={image.url}
          alt={image.alt || 'Project image'}
          className="w-full h-full object-cover"
        />

        <div
          {...attributes}
          {...listeners}
          className={cn(
            'absolute top-2 left-2 p-2 rounded-full cursor-grab active:cursor-grabbing',
            'bg-bg-elevated border border-line-strong',
            'shadow-surface-raised',
            'opacity-0 group-hover:opacity-100 transition-opacity'
          )}
        >
          <GripVertical className="h-4 w-4 text-[var(--text-secondary)]" />
        </div>

        {isThumbnail && (
          <div
            className={cn(
              'absolute top-2 right-2 p-2 rounded-full',
              'bg-accent text-accent-foreground border border-line-strong',
              'shadow-surface-raised-sm'
            )}
          >
            <Star className="h-4 w-4 fill-current" />
          </div>
        )}

        <Button
          type="button"
          size="sm"
          variant="destructive"
          className={cn(
            'absolute bottom-2 right-2',
            'opacity-0 group-hover:opacity-100 transition-opacity',
            'h-8 w-8 p-0 rounded-full'
          )}
          onClick={onDelete}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      <div className="p-3 space-y-2">
        <Input
          placeholder="Caption (optional)"
          value={image.caption || ''}
          onChange={(e) => onUpdateCaption(e.target.value)}
          className="text-sm"
        />
        <Input
          placeholder="Alt text (optional)"
          value={image.alt || ''}
          onChange={(e) => onUpdateAlt(e.target.value)}
          className="text-sm"
        />
      </div>
    </div>
  );
}

export function DraggableImageGrid({ images, projectId, onUpdate }: DraggableImageGridProps) {
  const [items, setItems] = useState(images);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = items.findIndex((item) => item.id === active.id);
      const newIndex = items.findIndex((item) => item.id === over.id);

      const newItems = arrayMove(items, oldIndex, newIndex);
      setItems(newItems);

      try {
        const response = await fetch(`/api/v1/admin/projects/${projectId}/images/reorder`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            imageIds: newItems.map((item) => item.id),
          }),
        });

        const data = await response.json();

        if (!data.success) {
          throw new Error(data.error || 'Reorder failed');
        }

        toast.success('Images reordered');
        onUpdate();
      } catch {
        toast.error('Failed to reorder images');
        setItems(images);
      }
    }
  };

  const handleDelete = async (id: string) => {
    setUpdating(true);
    try {
      const response = await fetch(`/api/v1/admin/projects/${projectId}/images/${id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Delete failed');
      }

      toast.success('Image deleted');
      onUpdate();
    } catch {
      toast.error('Failed to delete image');
    } finally {
      setUpdating(false);
      setDeleteId(null);
    }
  };

  const handleUpdateField = async (id: string, field: 'caption' | 'alt', value: string) => {
    try {
      const response = await fetch(`/api/v1/admin/projects/${projectId}/images/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [field]: value }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Update failed');
      }

      setItems((prev) => prev.map((item) => (item.id === id ? { ...item, [field]: value } : item)));
    } catch {
      toast.error(`Failed to update ${field}`);
    }
  };

  if (items.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-[var(--text-secondary)]">No images yet. Upload some images to get started.</p>
      </div>
    );
  }

  return (
    <>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={items} strategy={rectSortingStrategy}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((image, index) => (
              <SortableImage
                key={image.id}
                image={image}
                isThumbnail={index === 0}
                onDelete={() => setDeleteId(image.id)}
                onUpdateCaption={(caption) => handleUpdateField(image.id, 'caption', caption)}
                onUpdateAlt={(alt) => handleUpdateField(image.id, 'alt', alt)}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      <DeleteConfirmModal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => deleteId && handleDelete(deleteId)}
        isDeleting={updating}
      />
    </>
  );
}
