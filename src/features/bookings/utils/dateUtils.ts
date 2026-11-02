import {
  addDaysToDateKey,
  getDateKeyWeekday,
  getJakartaDateKey,
  getWeekStartKey,
  jakartaWallClockToInstant,
} from '@/lib/utils/date';

export interface WeekDates {
  start: Date;
  end: Date;
  days: Date[];
  startKey: string;
  endKey: string;
}

export function getWeekDates(date?: Date | string): WeekDates {
  const startKey = getWeekStartKey(getJakartaDateKey(date ?? new Date()));
  const endKey = addDaysToDateKey(startKey, 6);

  const days = Array.from({ length: 7 }, (_, offset) =>
    jakartaWallClockToInstant(addDaysToDateKey(startKey, offset))
  );

  return {
    start: jakartaWallClockToInstant(startKey),
    end: jakartaWallClockToInstant(endKey),
    days,
    startKey,
    endKey,
  };
}

export function formatDateShort(date: Date): string {
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    timeZone: 'Asia/Jakarta',
  });
}

export function formatDateFull(date: Date): string {
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    timeZone: 'Asia/Jakarta',
  });
}

export function formatDateISO(date: Date): string {
  return getJakartaDateKey(date);
}

export function calculateEndTime(startTime: string, durationMinutes: number = 60): string {
  const [hours, minutes] = startTime.split(':').map(Number);
  const totalMinutes = hours * 60 + minutes + durationMinutes;
  const endHours = Math.floor(totalMinutes / 60) % 24;
  const endMinutes = totalMinutes % 60;
  return `${endHours.toString().padStart(2, '0')}:${endMinutes.toString().padStart(2, '0')}`;
}

export function isToday(date: Date): boolean {
  return getJakartaDateKey(date) === getJakartaDateKey();
}

export function isThisWeek(weekStart: Date): boolean {
  return getWeekStartKey(getJakartaDateKey(weekStart)) === getWeekDates().startKey;
}

export function dateKeyToInstant(dateKey: string): Date {
  return jakartaWallClockToInstant(dateKey);
}

export function getWeekdayIndex(date: Date): number {
  return getDateKeyWeekday(getJakartaDateKey(date));
}

export function getDayOfMonth(date: Date): number {
  return Number(getJakartaDateKey(date).slice(8, 10));
}
