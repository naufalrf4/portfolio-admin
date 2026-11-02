export const SURFACE_STYLES = {
  background: 'var(--bg-elevated)',
  foreground: 'var(--text-primary)',
  muted: 'var(--text-secondary)',
  accent: 'var(--teal)',
  accentLight: 'var(--teal)',
  success: 'var(--teal)',
  shadows: {
    extruded: '0 2px 8px -2px rgba(0, 0, 0, 0.3)',
    inset: 'inset 0 1px 4px rgba(0, 0, 0, 0.25)',
    insetDeep:
      'inset 0 1px 4px rgba(0, 0, 0, 0.25)',
    small: '0 2px 8px -2px rgba(0, 0, 0, 0.3)',
  },
};

export const FILTER_BUTTONS = [
  { key: 'all' as const, label: 'All' },
  { key: 'visible' as const, label: 'Visible' },
  { key: 'hidden' as const, label: 'Hidden' },
];

export const SKELETON_COUNT = 6;
