import type { FilterTab } from '../types/messages.types';

export const SURFACE_SHADOWS = {
  extruded: '0 2px 8px -2px rgba(0, 0, 0, 0.3)',
  inset: 'inset 0 1px 4px rgba(0, 0, 0, 0.25)',
  extrudedSm: '0 2px 8px -2px rgba(0, 0, 0, 0.3)',
  insetSm: 'inset 0 1px 4px rgba(0, 0, 0, 0.25)',
};

export const COLORS = {
  background: 'var(--bg-elevated)',
  foreground: 'var(--text-primary)',
  muted: 'var(--text-secondary)',
  accent: 'var(--teal)',
  amber: 'var(--amber)',
  accentSoft: 'var(--teal-soft)',
  amberSoft: 'var(--amber-soft)',
  border: 'var(--border)',
};

export const FILTER_TABS: { key: FilterTab; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'unread', label: 'Unread' },
  { key: 'read', label: 'Read' },
];
