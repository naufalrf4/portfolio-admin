'use client';

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  horizontalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Plus, X, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface DraggableRolesProps {
  roles: string[];
  setRoles: (roles: string[]) => void;
  roleInput: string;
  setRoleInput: (value: string) => void;
  addRole: () => void;
  removeRole: (role: string) => void;
}

export function DraggableRoles({
  roles,
  setRoles,
  roleInput,
  setRoleInput,
  addRole,
  removeRole,
}: DraggableRolesProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = roles.indexOf(active.id as string);
      const newIndex = roles.indexOf(over.id as string);
      const reorderedRoles = arrayMove(roles, oldIndex, newIndex);
      setRoles(reorderedRoles);
    }
  };

  return (
    <div className="space-y-4">
      {roles.length === 0 ? (
        <div
          className="flex flex-col items-center justify-center py-8 rounded-2xl bg-[var(--bg-elevated)]"
          style={{
            boxShadow: '0 2px 8px -2px rgba(0, 0, 0, 0.3)',
          }}
        >
          <p className="text-sm text-[var(--text-secondary)]">No roles added yet. Add your first role below.</p>
        </div>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={roles} strategy={horizontalListSortingStrategy}>
            <div className="flex flex-wrap gap-3">
              {roles.map((role, index) => (
                <SortableRoleItem
                  key={role}
                  role={role}
                  index={index}
                  isPrimary={index === 0}
                  onRemove={() => removeRole(role)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      <div className="flex gap-2">
        <Input
          value={roleInput}
          onChange={(e) => setRoleInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              addRole();
            }
          }}
          placeholder="Add new role..."
          className="flex-1"
        />
        <Button onClick={addRole} disabled={!roleInput.trim()}>
          <Plus className="h-4 w-4 mr-2" />
          Add
        </Button>
      </div>
    </div>
  );
}

interface SortableRoleItemProps {
  role: string;
  index: number;
  isPrimary: boolean;
  onRemove: () => void;
}

function SortableRoleItem({ role, index, isPrimary, onRemove }: SortableRoleItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: role,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`
        group relative flex items-center gap-2 px-4 py-3 rounded-xl
        bg-[var(--bg-elevated)] cursor-grab active:cursor-grabbing
        transition-all duration-200
        ${isDragging ? 'scale-105 z-50' : 'hover:scale-[1.02]'}
        ${isPrimary ? 'ring-2 ring-[var(--teal)] ring-offset-2 ring-offset-[var(--bg-elevated)]' : ''}
      `}
      {...attributes}
      {...listeners}
    >
      <div
        className={`
          absolute inset-0 rounded-xl transition-all duration-200
          ${isDragging ? 'shadow-surface-raised' : 'shadow-surface-raised-sm'}
        `}
      />

      <div className="relative flex items-center gap-3">
        <GripVertical className="h-4 w-4 text-[var(--text-secondary)] opacity-60 group-hover:opacity-100 transition-opacity" />

        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="text-xs text-[var(--text-secondary)] font-medium">{index + 1}.</span>
            <span className={`font-medium ${isPrimary ? 'text-[var(--teal)]' : 'text-[var(--text-primary)]'}`}>
              {role}
            </span>
          </div>

          {isPrimary && (
            <div className="flex items-center gap-1 mt-1">
              <Star className="h-3 w-3 text-amber-500 fill-amber-500" />
              <span className="text-xs font-medium text-accent">
                Primary
              </span>
            </div>
          )}
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className={`
            ml-2 p-1 rounded-lg transition-all duration-200
            opacity-0 group-hover:opacity-100
            hover:bg-red-100 text-[var(--text-secondary)] hover:text-red-500
          `}
          aria-label={`Remove ${role}`}
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
