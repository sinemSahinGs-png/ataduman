export const RESERVED_DATE_SLUGS = new Set([
  'date',
  'api',
  'admin',
  'legacy',
  'favicon.ico',
  'robots.txt',
  'sitemap.xml',
  '_next',
  'next',
]);

const CHAR_MAP: Record<string, string> = {
  ç: 'c',
  Ç: 'c',
  ğ: 'g',
  Ğ: 'g',
  ı: 'i',
  I: 'i',
  İ: 'i',
  i: 'i',
  ö: 'o',
  Ö: 'o',
  ş: 's',
  Ş: 's',
  ü: 'u',
  Ü: 'u',
};

export function transliterateTurkish(input: string): string {
  return input
    .split('')
    .map((ch) => CHAR_MAP[ch] ?? ch)
    .join('');
}

export function slugifyNameToDate(name: string): string {
  const base = transliterateTurkish(name)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '')
    .replace(/^-+|-+$/g, '');
  return base ? `${base}date` : 'date';
}

export function normalizeSlug(input: string): string {
  return transliterateTurkish(input)
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, '')
    .replace(/-{2,}/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function isValidSlug(slug: string): boolean {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) && !RESERVED_DATE_SLUGS.has(slug);
}

export function buildQuestion(
  name: string,
  honorific: string,
  maleName: string,
  customQuestion?: string | null
): string {
  if (customQuestion?.trim()) return customQuestion.trim();
  return `${name} ${honorific}, ${maleName}'la date'e çıkmak ister misiniz?`;
}

export function formatTurkishDate(dateInput: string | Date, withWeekday = false): string {
  const date = typeof dateInput === 'string' ? new Date(`${dateInput}T12:00:00`) : dateInput;
  const options: Intl.DateTimeFormatOptions = withWeekday
    ? { day: 'numeric', month: 'long', year: 'numeric', weekday: 'long' }
    : { day: 'numeric', month: 'long', year: 'numeric' };
  return new Intl.DateTimeFormat('tr-TR', options).format(date);
}

export function formatTurkishDateTime(dateInput: string | Date): string {
  const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  return new Intl.DateTimeFormat('tr-TR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

export function todayISODate(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function isPastDate(isoDate: string): boolean {
  return isoDate < todayISODate();
}
