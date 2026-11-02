import type { LucideIcon } from 'lucide-react';
import { ICON_OPTIONS, DEFAULT_ICON } from '../constants/links.constants';

export function getIconData(iconName: string | null): { icon: LucideIcon; color: string } {
  if (!iconName) return DEFAULT_ICON;
  const iconOption = ICON_OPTIONS.find((opt) => opt.value === iconName);
  return iconOption ? { icon: iconOption.icon, color: iconOption.color } : DEFAULT_ICON;
}
