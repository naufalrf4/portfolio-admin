import {
  Github,
  Twitter,
  Linkedin,
  Mail,
  Globe,
  Facebook,
  Instagram,
  Youtube,
  Link2,
  type LucideIcon,
} from 'lucide-react';

export const SURFACE_STYLES = {
  background: 'var(--bg-elevated)',
  foreground: 'var(--text-primary)',
  muted: 'var(--text-secondary)',
  accent: 'var(--teal)',
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

export const ICON_OPTIONS: { value: string; label: string; icon: LucideIcon; color: string }[] = [
  { value: 'github', label: 'GitHub', icon: Github, color: '#333333' },
  { value: 'twitter', label: 'Twitter', icon: Twitter, color: '#1DA1F2' },
  { value: 'linkedin', label: 'LinkedIn', icon: Linkedin, color: '#0A66C2' },
  { value: 'mail', label: 'Email', icon: Mail, color: '#EA4335' },
  { value: 'globe', label: 'Website', icon: Globe, color: 'var(--teal)' },
  { value: 'facebook', label: 'Facebook', icon: Facebook, color: '#1877F2' },
  { value: 'instagram', label: 'Instagram', icon: Instagram, color: '#E4405F' },
  { value: 'youtube', label: 'YouTube', icon: Youtube, color: '#FF0000' },
];

export const INITIAL_FORM_DATA = {
  label: '',
  url: '',
  icon: '',
};

export const DEFAULT_ICON = { icon: Link2, color: 'var(--teal)' };
