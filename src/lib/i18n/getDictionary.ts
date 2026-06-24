import type { Locale } from './config';
import vi from './dictionaries/vi.json';
import en from './dictionaries/en.json';

const dictionaries = { vi, en } as const;

export type Dictionary = typeof vi;

/** Server + client safe: dictionaries are static JSON imports. */
export function getDictionary(locale: Locale): Dictionary {
  return (dictionaries[locale] ?? dictionaries.vi) as Dictionary;
}
