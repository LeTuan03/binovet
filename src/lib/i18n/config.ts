export const locales = ['vi', 'en'] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = 'vi';

export function isLocale(value: string | undefined | null): value is Locale {
  return value === 'vi' || value === 'en';
}

/** Normalise an arbitrary value to a supported locale (falls back to default). */
export function resolveLocale(value: string | undefined | null): Locale {
  return isLocale(value) ? value : defaultLocale;
}

/**
 * Build a locale-prefixed path. Accepts absolute app paths ("/san-pham"),
 * external/hash/mailto/tel links (returned untouched), and already-prefixed
 * paths (normalised to the requested locale).
 */
export function localePath(locale: Locale, path: string | null | undefined): string {
  if (!path) return `/${locale}`;
  // Leave external + non-navigational links alone.
  if (/^(https?:|mailto:|tel:|#|\/\/)/i.test(path)) return path;
  if (!path.startsWith('/')) path = `/${path}`;
  // Strip an existing locale prefix so we never double-prefix.
  const segments = path.split('/');
  if (isLocale(segments[1])) {
    segments.splice(1, 1);
    path = segments.join('/') || '/';
  }
  if (path === '/') return `/${locale}`;
  return `/${locale}${path}`;
}

/** Swap the locale segment of the current pathname (for the language switcher). */
export function switchLocalePath(pathname: string, nextLocale: Locale): string {
  const segments = pathname.split('/');
  if (isLocale(segments[1])) {
    segments[1] = nextLocale;
    return segments.join('/') || `/${nextLocale}`;
  }
  return `/${nextLocale}${pathname === '/' ? '' : pathname}`;
}
