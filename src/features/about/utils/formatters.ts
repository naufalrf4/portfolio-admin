import type { ExperienceItem, ExperienceType } from '../types/about.types';
import { calendarDateToMonthKey, monthKeyToCalendarDate } from '@/lib/utils/date';

export function parseMonthDate(dateStr: string): Date | null {
  return monthKeyToCalendarDate(dateStr);
}

export function formatMonthDate(date: Date | null): string {
  return calendarDateToMonthKey(date);
}

export function getTitleLabel(type: string): string {
  if (type === 'Education') return 'Degree';
  if (type === 'Certification') return 'Certification';
  return 'Position';
}

export function getOrganizationLabel(type: string): string {
  if (type === 'Education') return 'Institution';
  if (type === 'Certification') return 'Issuer';
  return 'Company/Organization';
}

export function filterExperienceByType(
  experiences: ExperienceItem[],
  type: ExperienceType
): ExperienceItem[] {
  return experiences.filter((item) => item.type === type);
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}
