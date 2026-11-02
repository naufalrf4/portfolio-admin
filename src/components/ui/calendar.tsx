'use client';

import * as React from 'react';
import { DayPicker, type DayPickerProps } from 'react-day-picker';
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';

import { cn } from '@/lib/utils';
import { buttonVariants } from '@/components/ui/button';

type CalendarProps = DayPickerProps;

function Calendar({ className, classNames, showOutsideDays = true, ...props }: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn('p-3', className)}
      classNames={{
        months: 'flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0',
        month: 'space-y-4',
        caption: 'flex justify-center pt-1 relative items-center',
        caption_label: 'text-sm font-medium text-[var(--text-primary)]',
        nav: 'space-x-1 flex items-center',
        nav_button: cn(
          buttonVariants({ variant: 'outline', size: 'icon-sm' }),
          'h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100'
        ),
        nav_button_previous: 'absolute left-1',
        nav_button_next: 'absolute right-1',
        table: 'w-full border-collapse space-y-1',
        head_row: 'flex',
        head_cell: 'text-[var(--text-primary)]/60 rounded-md w-9 font-normal text-[0.8rem]',
        row: 'flex w-full mt-2',
        cell: cn(
          'relative p-0 text-center text-sm focus-within:relative focus-within:z-20 [&:has([aria-selected])]:bg-[var(--teal)]/10 [&:has([aria-selected].day-outside)]:bg-[var(--teal)]/5',
          '[&:has([aria-selected].day-range-end)]:rounded-r-xl',
          '[&:has([aria-selected].day-range-start)]:rounded-l-xl'
        ),
        day: cn(
          buttonVariants({ variant: 'ghost' }),
          'h-9 w-9 p-0 font-normal aria-selected:opacity-100'
        ),
        day_range_start: 'day-range-start',
        day_range_end: 'day-range-end',
        day_selected:
          'bg-[var(--teal)] text-on-accent hover:bg-[var(--teal)] hover:text-on-accent focus:bg-[var(--teal)] focus:text-on-accent shadow-surface-raised-sm',
        day_today: 'bg-[var(--teal)]/10 text-[var(--teal)] font-semibold',
        day_outside:
          'day-outside text-[var(--text-primary)]/40 opacity-50 aria-selected:bg-[var(--teal)]/5 aria-selected:text-[var(--text-primary)]/40 aria-selected:opacity-30',
        day_disabled: 'text-[var(--text-primary)]/30 opacity-50',
        day_range_middle: 'aria-selected:bg-[var(--teal)]/10 aria-selected:text-[var(--text-primary)]',
        day_hidden: 'invisible',
        ...classNames,
      }}
      components={{
        Chevron: (props) =>
          props.orientation === 'left' ? (
            <ChevronLeftIcon className="h-4 w-4" />
          ) : (
            <ChevronRightIcon className="h-4 w-4" />
          ),
      }}
      {...props}
    />
  );
}

Calendar.displayName = 'Calendar';

export { Calendar };
export type { CalendarProps };
