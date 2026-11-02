import {
  Github,
  Linkedin,
  Twitter,
  Instagram,
  Youtube,
  Facebook,
  Mail,
  Globe,
  Link2,
  type LucideIcon,
} from 'lucide-react';

export interface IconOption {
  value: string;
  label: string;
  icon: LucideIcon;
  color: string;
}

export const ICON_OPTIONS: IconOption[] = [
  { value: 'github', label: 'GitHub', icon: Github, color: '#333333' },
  { value: 'linkedin', label: 'LinkedIn', icon: Linkedin, color: '#0A66C2' },
  { value: 'twitter', label: 'Twitter', icon: Twitter, color: '#1DA1F2' },
  { value: 'instagram', label: 'Instagram', icon: Instagram, color: '#E4405F' },
  { value: 'youtube', label: 'YouTube', icon: Youtube, color: '#FF0000' },
  { value: 'facebook', label: 'Facebook', icon: Facebook, color: '#1877F2' },
  { value: 'mail', label: 'Email', icon: Mail, color: '#EA4335' },
  { value: 'globe', label: 'Website', icon: Globe, color: 'var(--teal)' },
  { value: 'link', label: 'Custom Link', icon: Link2, color: 'var(--text-secondary)' },
];

export function getIconComponent(iconName: string | undefined): {
  icon: LucideIcon;
  color: string;
} {
  if (!iconName) return { icon: Link2, color: 'var(--teal)' };
  const iconOption = ICON_OPTIONS.find((opt) => opt.value === iconName);
  return iconOption
    ? { icon: iconOption.icon, color: iconOption.color }
    : { icon: Link2, color: 'var(--teal)' };
}
