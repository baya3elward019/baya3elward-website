const BASE = import.meta.env.BASE_URL.replace(/\/$/, '');

/** Internal link that respects the site base path: url('/writeups/') */
export function url(path = '/'): string {
  if (/^(https?:|mailto:|tel:|#)/.test(path)) return path;
  const p = path.startsWith('/') ? path : `/${path}`;
  return `${BASE}${p}` || '/';
}

/** Image path from the CMS ("/images/x.png") or a full external URL. */
export function img(src?: string | null): string | undefined {
  if (!src) return undefined;
  if (/^(https?:|data:)/.test(src)) return src;
  return url(src);
}

export function formatDate(d: Date, style: 'short' | 'long' = 'short'): string {
  return d.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: style === 'long' ? 'long' : 'short',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

export function isoDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export function readingTime(body = ''): number {
  const words = body.replace(/```[\s\S]*?```/g, ' ').split(/\s+/).filter(Boolean).length;
  const codeLines = (body.match(/```[\s\S]*?```/g) ?? []).join('\n').split('\n').length;
  return Math.max(1, Math.round(words / 200 + codeLines / 40));
}

export const categoryLabel: Record<string, string> = {
  'write-up': 'Write-up',
  article: 'Article',
  experiment: 'Experiment',
  news: 'News',
};

export const byDateDesc = <T extends { data: { date: Date } }>(a: T, b: T) =>
  b.data.date.getTime() - a.data.date.getTime();

export const published = <T extends { data: { draft?: boolean } }>(e: T) => !e.data.draft;

/** Button text for a project's live link, by project type. */
export const launchLabel: Record<string, string> = {
  game: 'Play now',
  app: 'Open app',
  site: 'Visit site',
  tool: 'Try it',
  other: 'Open live',
};
export const kindLabel: Record<string, string> = {
  game: 'Game',
  app: 'Web app',
  site: 'Website',
  tool: 'Tool',
};
