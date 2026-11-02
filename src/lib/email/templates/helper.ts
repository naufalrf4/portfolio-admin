export function escapeHtml(value: string | number | null | undefined): string {
  if (value === null || value === undefined) {
    return '';
  }

  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function preserveLineBreaks(value: string | null | undefined): string {
  return escapeHtml(value).replace(/\n/g, '<br />');
}

export function formatReference(id: string): string {
  return `#${id.slice(0, 8).toUpperCase()}`;
}

export function formatDuration(minutes: number): string {
  return `${minutes} min`;
}
