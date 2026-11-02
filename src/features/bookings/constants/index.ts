export const DAY_NAMES = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
] as const;

export const SHORT_DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const;

export const COMMON_TIMES = [
  '09:00',
  '10:00',
  '11:00',
  '12:00',
  '13:00',
  '14:00',
  '15:00',
  '16:00',
  '17:00',
] as const;

export const COMMON_TIMEZONES = [
  { value: 'America/New_York', label: 'Eastern Time (ET)' },
  { value: 'America/Chicago', label: 'Central Time (CT)' },
  { value: 'America/Denver', label: 'Mountain Time (MT)' },
  { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
  { value: 'Europe/London', label: 'London (GMT/BST)' },
  { value: 'Europe/Paris', label: 'Paris (CET/CEST)' },
  { value: 'Asia/Dubai', label: 'Dubai (GST)' },
  { value: 'Asia/Kolkata', label: 'India (IST)' },
  { value: 'Asia/Shanghai', label: 'China (CST)' },
  { value: 'Asia/Tokyo', label: 'Tokyo (JST)' },
  { value: 'Asia/Singapore', label: 'Singapore (SGT)' },
  { value: 'Asia/Jakarta', label: 'Jakarta (WIB)' },
  { value: 'Australia/Sydney', label: 'Sydney (AEDT/AEST)' },
  { value: 'UTC', label: 'UTC' },
] as const;

export const REMINDER_DAYS = [
  { value: 0, label: 'Sunday' },
  { value: 1, label: 'Monday' },
  { value: 2, label: 'Tuesday' },
  { value: 3, label: 'Wednesday' },
  { value: 4, label: 'Thursday' },
  { value: 5, label: 'Friday' },
  { value: 6, label: 'Saturday' },
] as const;

export const FILTER_BUTTONS = [
  { key: 'all', label: 'All' },
  { key: 'PENDING', label: 'Pending' },
  { key: 'CONFIRMED', label: 'Confirmed' },
  { key: 'COMPLETED', label: 'Completed' },
  { key: 'CANCELLED', label: 'Cancelled' },
] as const;

export const SLOT_STATUS_STYLES = {
  AVAILABLE: {
    bg: 'bg-[var(--teal)]/10',
    border: 'border-[var(--teal)]/30',
    text: 'text-[var(--teal)]',
  },
  BOOKED: {
    bg: 'bg-[var(--teal)]/10',
    border: 'border-[var(--teal)]/30',
    text: 'text-[var(--teal)]',
  },
  BLOCKED: {
    bg: 'bg-[var(--text-secondary)]/10',
    border: 'border-[var(--text-secondary)]/30',
    text: 'text-[var(--text-secondary)]',
  },
} as const;

export const SURFACE_STYLES = {
  card: {
    background: 'var(--bg-elevated)',
    boxShadow: '0 2px 8px -2px rgba(0, 0, 0, 0.3)',
  },
  cardInset: {
    boxShadow: '0 2px 8px -2px rgba(0, 0, 0, 0.3)',
  },
  button: {
    boxShadow: '0 2px 8px -2px rgba(0, 0, 0, 0.3)',
  },
  buttonSmall: {
    boxShadow: '0 2px 8px -2px rgba(0, 0, 0, 0.3)',
  },
  buttonMicro: {
    boxShadow: '0 2px 8px -2px rgba(0, 0, 0, 0.3)',
  },
  inputInset: {
    boxShadow: '0 2px 8px -2px rgba(0, 0, 0, 0.3)',
  },
  iconContainer: {
    boxShadow: '0 2px 8px -2px rgba(0, 0, 0, 0.3)',
  },
} as const;
