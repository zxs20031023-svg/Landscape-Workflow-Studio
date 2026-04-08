export function normalizeText(value: string): string {
  return value.toLowerCase().replace(/\s+/g, '');
}

export function splitByPunctuation(text: string): string[] {
  return text
    .split(/[，。；、,\n\r\s]+/)
    .map((item) => item.trim())
    .filter(Boolean);
}

export function uniqueItems<T>(items: T[]): T[] {
  return Array.from(new Set(items));
}

export function createId(prefix: string): string {
  const random = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${random}`;
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function sortByDateDesc<T extends { createdAt: string }>(items: T[]): T[] {
  return [...items].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}
