export function truncate(text: string, length: number = 100): string {
  if (text.length <= length) {
    return text;
  }
  return text.substring(0, length) + '...';
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function capitalizeFirst(text: string): string {
  if (!text) return text;
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export function truncateUrl(url: string, maxLength: number = 40): string {
  try {
    const parsed = new URL(url);
    const pathMaxLength = maxLength - parsed.hostname.length;
    const path =
      parsed.pathname.length > pathMaxLength
        ? parsed.pathname.slice(0, pathMaxLength) + '...'
        : parsed.pathname;
    return parsed.hostname + path;
  } catch {
    return truncate(url, maxLength);
  }
}

export function getInitials(name: string | null, fallback: string): string {
  if (!name) {
    return fallback.split('@')[0].substring(0, 2).toUpperCase();
  }

  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);
}
