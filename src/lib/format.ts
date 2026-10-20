const ESCAPES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
};

export interface TextRun {
  text: string;
  em: boolean;
}

/** "the *porch light*." -> "the ", "porch light" (em), ".". A lone * stays as it is. */
export function emphasisRuns(text: string): TextRun[] {
  return text
    .split(/\*(.+?)\*/)
    .map((part, i) => ({ text: part, em: i % 2 === 1 }))
    .filter((run) => run.text);
}

/** Escapes text for set:html, with *phrase* as <em>phrase</em>. */
export function emphasize(text: string): string {
  return emphasisRuns(text)
    .map((run) => {
      const escaped = run.text.replace(/[&<>"']/g, (c) => ESCAPES[c]);
      return run.em ? `<em>${escaped}</em>` : escaped;
    })
    .join('');
}

/** Drops the *emphasis* markers, for places that can't style text (alt text, meta tags). */
export function plainText(text: string): string {
  return emphasisRuns(text)
    .map((run) => run.text)
    .join('');
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
