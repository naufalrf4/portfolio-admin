export const SURFACE_STYLES = {
  background: 'var(--bg-elevated)',
  foreground: 'var(--text-primary)',
  muted: 'var(--text-secondary)',
  accent: 'var(--teal)',
  accentForeground: 'var(--on-accent)',
  accentLight: 'var(--amber)',
  success: 'var(--teal)',
  shadows: {
    extruded: '0 2px 8px -2px rgba(0, 0, 0, 0.3)',
    inset: 'inset 0 1px 4px rgba(0, 0, 0, 0.25)',
    insetDeep:
      'inset 0 1px 4px rgba(0, 0, 0, 0.25)',
    small: '0 2px 8px -2px rgba(0, 0, 0, 0.3)',
  },
};

export const INPUT_CLASS_NAME =
  'w-full px-4 py-3 rounded-2xl border-none outline-none transition-all duration-200 focus:ring-2 focus:ring-[var(--teal)]/30 placeholder:text-[var(--text-secondary)]';

export const INPUT_STYLE = {
  backgroundColor: SURFACE_STYLES.background,
  boxShadow: SURFACE_STYLES.shadows.inset,
  color: SURFACE_STYLES.foreground,
};

export const FILTER_BUTTONS = [
  { key: 'all' as const, label: 'All' },
  { key: 'visible' as const, label: 'Visible' },
  { key: 'hidden' as const, label: 'Hidden' },
];
