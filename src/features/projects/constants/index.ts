import { Eye, EyeOff, Star } from 'lucide-react';
import type { FilterMode } from '../types/projects.types';

export const FILTER_BUTTONS = [
  { mode: 'all' as FilterMode, label: 'All', icon: null },
  { mode: 'visible' as FilterMode, label: 'Visible', icon: Eye },
  { mode: 'hidden' as FilterMode, label: 'Hidden', icon: EyeOff },
  { mode: 'featured' as FilterMode, label: 'Featured', icon: Star },
] as const;

export const SURFACE_STYLES = {
  card: {
    boxShadow: '0 2px 8px -2px rgba(0, 0, 0, 0.3)',
  },
  iconContainer: {
    boxShadow: '0 2px 8px -2px rgba(0, 0, 0, 0.3)',
  },
  techBadge: {
    boxShadow: '0 2px 8px -2px rgba(0, 0, 0, 0.3)',
  },
  techBadgeSmall: {
    boxShadow: '0 2px 8px -2px rgba(0, 0, 0, 0.3)',
  },
} as const;
