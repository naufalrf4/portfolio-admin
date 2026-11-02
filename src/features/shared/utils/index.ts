import {
  JAKARTA_TIMEZONE,
  addDaysToDateKey,
  formatDateTime as canonicalFormatDateTime,
  getJakartaDateKey,
  getWeekStartKey,
  calendarDateToMonthKey,
  jakartaWallClockToInstant,
  monthKeyToCalendarDate,
} from '@/lib/utils/date';
import { ICON_OPTIONS, DEFAULT_ICON } from '@/features/links/constants/links.constants';
import type { LucideIcon } from 'lucide-react';

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export function formatDateISO(date: Date): string {
  return getJakartaDateKey(date);
}

export function formatDateShort(date: Date): string {
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    timeZone: JAKARTA_TIMEZONE,
  });
}

export function formatDateFull(date: Date): string {
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    timeZone: JAKARTA_TIMEZONE,
  });
}

export function formatDateTime(date: Date | string): string {
  return canonicalFormatDateTime(date);
}

export function parseMonthDate(dateStr: string): Date | null {
  return monthKeyToCalendarDate(dateStr);
}

export function formatMonthDate(date: Date | null): string {
  return calendarDateToMonthKey(date);
}

export function getWeekDates(date: Date): { start: Date; end: Date; days: Date[] } {
  const startKey = getWeekStartKey(getJakartaDateKey(date));

  return {
    start: jakartaWallClockToInstant(startKey),
    end: jakartaWallClockToInstant(addDaysToDateKey(startKey, 6)),
    days: Array.from({ length: 7 }, (_, offset) =>
      jakartaWallClockToInstant(addDaysToDateKey(startKey, offset))
    ),
  };
}

export function isToday(date: Date): boolean {
  return getJakartaDateKey(date) === getJakartaDateKey();
}

export function isThisWeek(date: Date): boolean {
  return getWeekStartKey(getJakartaDateKey(date)) === getWeekStartKey(getJakartaDateKey());
}

export function calculateEndTime(startTime: string, durationMinutes: number = 60): string {
  const [hours, minutes] = startTime.split(':').map(Number);
  const totalMinutes = hours * 60 + minutes + durationMinutes;
  const endHours = Math.floor(totalMinutes / 60) % 24;
  const endMinutes = totalMinutes % 60;
  return `${endHours.toString().padStart(2, '0')}:${endMinutes.toString().padStart(2, '0')}`;
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength - 3)}...`;
}

export function pluralize(count: number, singular: string, plural?: string): string {
  const pluralForm = plural || `${singular}s`;
  return count === 1 ? singular : pluralForm;
}

export function debounce<T extends (...args: unknown[]) => void>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return function executedFunction(...args: Parameters<T>) {
    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(() => func(...args), wait);
  };
}

export function groupBy<T>(array: T[], key: keyof T): Record<string, T[]> {
  return array.reduce(
    (result, item) => {
      const groupKey = String(item[key]);
      if (!result[groupKey]) {
        result[groupKey] = [];
      }
      result[groupKey].push(item);
      return result;
    },
    {} as Record<string, T[]>
  );
}

export function sortByDate<T extends { createdAt: string | Date }>(
  items: T[],
  order: 'asc' | 'desc' = 'desc'
): T[] {
  return [...items].sort((a, b) => {
    const dateA = new Date(a.createdAt).getTime();
    const dateB = new Date(b.createdAt).getTime();
    return order === 'asc' ? dateA - dateB : dateB - dateA;
  });
}

export function sortByOrder<T extends { order: number }>(items: T[]): T[] {
  return [...items].sort((a, b) => a.order - b.order);
}

export function getPlatformFromUrl(
  url: string | null | undefined
): { icon: LucideIcon; color: string; label: string } {
  const fallback = { ...DEFAULT_ICON, label: 'Link' };
  if (!url) return fallback;

  let hostname: string;
  try {
    hostname = new URL(url).hostname.replace(/^www\./, '').toLowerCase();
  } catch {
    return fallback;
  }

  if (hostname.includes('github.com')) {
    return ICON_OPTIONS.find((option) => option.value === 'github')!;
  }
  if (hostname.includes('linkedin.com')) {
    return ICON_OPTIONS.find((option) => option.value === 'linkedin')!;
  }
  if (hostname.includes('twitter.com') || hostname.includes('x.com')) {
    return ICON_OPTIONS.find((option) => option.value === 'twitter')!;
  }
  if (hostname.includes('instagram.com')) {
    return ICON_OPTIONS.find((option) => option.value === 'instagram')!;
  }
  if (hostname.includes('youtube.com') || hostname.includes('youtu.be')) {
    return ICON_OPTIONS.find((option) => option.value === 'youtube')!;
  }
  if (hostname.includes('facebook.com')) {
    return ICON_OPTIONS.find((option) => option.value === 'facebook')!;
  }

  return ICON_OPTIONS.find((option) => option.value === 'globe')!;
}
