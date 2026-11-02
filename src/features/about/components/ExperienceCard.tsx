'use client';

import { Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { ExperienceItem } from '../types/about.types';

interface ExperienceCardProps {
  experience: ExperienceItem;
  onEdit: () => void;
  onDelete: () => void;
}

export function ExperienceCard({ experience, onEdit, onDelete }: ExperienceCardProps) {
  return (
    <div className="p-4 rounded-2xl bg-[var(--bg-elevated)] shadow-surface-raised">
      <div className="flex items-start justify-between gap-4">
        <div className="flex gap-3 flex-1 min-w-0">
          {experience.logoUrl ? (
            <img
              src={experience.logoUrl}
              alt={`${experience.organization} logo`}
              className="w-12 h-12 rounded-xl object-cover shrink-0 shadow-surface-raised"
            />
          ) : (
            <div className="w-12 h-12 rounded-xl bg-accent flex items-center justify-center shrink-0 shadow-surface-raised">
              <span className="text-accent-foreground font-bold text-lg">
                {experience.organization.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-[var(--text-primary)]">{experience.title}</h4>
            <p className="text-sm text-[var(--text-secondary)]">
              {experience.organization}
              {experience.location && ` • ${experience.location}`}
            </p>
            <p className="text-xs text-[var(--text-secondary)] mt-1">
              {experience.startDate} - {experience.endDate || 'Present'}
            </p>
            {experience.description && (
              <p className="text-sm text-[var(--text-primary)] mt-2 line-clamp-2">{experience.description}</p>
            )}
            {experience.skills && experience.skills.length > 0 ? (
              <div className="mt-3 flex flex-wrap gap-2">
                {experience.skills.map((skill) => (
                  <span
                    key={skill}
                    className="rounded-lg bg-[var(--bg-elevated)] px-2.5 py-1 text-xs text-[var(--text-primary)] shadow-surface-raised"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            ) : null}
          </div>
        </div>
        <div className="flex gap-2 shrink-0">
          <Button size="icon-sm" variant="ghost" onClick={onEdit}>
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            size="icon-sm"
            variant="ghost"
            onClick={onDelete}
            className="text-red-500 hover:text-red-600 hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
