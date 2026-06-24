import type { Locale } from './config';

/**
 * Resolve per-locale content fields on a DB row.
 *
 * Convention: Vietnamese is the canonical field (`title`, `name`, ...) and the
 * English override lives in a sibling `*En` field (`titleEn`, `nameEn`, ...).
 * When rendering English, a non-empty `*En` value replaces its base field;
 * otherwise it falls back to Vietnamese. The raw `*En` keys are stripped from
 * the returned object so public payloads stay clean (admin reads the raw rows).
 */
export function localize<T extends Record<string, any>>(
  row: T | null | undefined,
  locale: Locale,
): T {
  if (!row || typeof row !== 'object') return row as unknown as T;
  const out: any = { ...row };
  for (const key of Object.keys(out)) {
    if (key.length > 2 && key.endsWith('En')) {
      const base = key.slice(0, -2);
      if (base in out) {
        const val = out[key];
        if (locale === 'en' && val != null && String(val).trim() !== '') {
          out[base] = val;
        }
        delete out[key];
      }
    }
  }
  return out as T;
}

export function localizeAll<T extends Record<string, any>>(
  rows: T[] | null | undefined,
  locale: Locale,
): T[] {
  return Array.isArray(rows) ? rows.map((r) => localize(r, locale)) : [];
}
