const ESCAPES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
};

/** Escapes text for set:html, then turns *phrase* into <em>phrase</em>. */
export function emphasize(text: string): string {
  return text.replace(/[&<>"']/g, (c) => ESCAPES[c]).replace(/\*(.+?)\*/g, '<em>$1</em>');
}

/** Drops the *emphasis* markers, for places that can't style text (alt text, meta tags). */
export function plainText(text: string): string {
  return text.replace(/\*(.+?)\*/g, '$1');
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function month(value: string): string {
  const [year, m] = value.split('-');
  return `${MONTHS[Number(m) - 1]} ${year}`;
}

/** "2024-11" + null -> "Nov 2024 – present". */
export function dateRange(start: string, end: string | null): string {
  return `${month(start)} – ${end ? month(end) : 'present'}`;
}

export const STATUS_LABEL = {
  'in-progress': 'In progress',
  live: 'Live',
  archived: 'Archived',
} as const;
