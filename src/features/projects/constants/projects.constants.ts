export const SURFACE_STYLES = {
  background: 'var(--bg-elevated)',
  foreground: 'var(--text-primary)',
  muted: 'var(--text-secondary)',
  accent: 'var(--teal)',
  accentLight: 'var(--amber)',
  success: 'var(--teal)',
  warning: 'var(--amber)',
  shadows: {
    extruded: '0 2px 8px -2px rgba(0, 0, 0, 0.3)',
    extrudedSmall: '0 2px 8px -2px rgba(0, 0, 0, 0.3)',
    inset: 'inset 0 1px 4px rgba(0, 0, 0, 0.25)',
    insetSmall:
      'inset 0 1px 4px rgba(0, 0, 0, 0.25)',
    insetTiny: 'inset 0 1px 4px rgba(0, 0, 0, 0.25)',
    small: '0 2px 8px -2px rgba(0, 0, 0, 0.3)',
    button: '0 2px 8px -2px rgba(0, 0, 0, 0.3)',
    hover: '0 2px 8px -2px rgba(0, 0, 0, 0.3)',
    activeInset:
      'inset 0 1px 4px rgba(0, 0, 0, 0.25)',
    viewToggleActive: '0 2px 8px -2px rgba(0, 0, 0, 0.3)',
    viewToggleInactive: '0 2px 8px -2px rgba(0, 0, 0, 0.3)',
  },
};

export const FILTER_BUTTON_STYLES = {
  active: `bg-[${SURFACE_STYLES.accent}] text-on-accent shadow-surface-raised-sm`,
  inactive: `bg-[${SURFACE_STYLES.background}] text-[${SURFACE_STYLES.foreground}] shadow-surface-raised-sm hover:shadow-surface-sunken`,
};
