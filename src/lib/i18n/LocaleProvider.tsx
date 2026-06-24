"use client";

import React, { createContext, useContext, useEffect } from 'react';
import type { Locale } from './config';
import type { Dictionary } from './getDictionary';

interface LocaleContextValue {
  locale: Locale;
  dict: Dictionary;
  /** Dot-path lookup into the dictionary, e.g. t('home.about.eyebrow'). */
  t: (path: string) => string;
}

const LocaleContext = createContext<LocaleContextValue | null>(null);

function lookup(obj: unknown, path: string): unknown {
  return path.split('.').reduce<unknown>((acc, key) => {
    if (acc && typeof acc === 'object') return (acc as Record<string, unknown>)[key];
    return undefined;
  }, obj);
}

export function LocaleProvider({
  locale,
  dict,
  children,
}: {
  locale: Locale;
  dict: Dictionary;
  children: React.ReactNode;
}) {
  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  const t = (path: string): string => {
    const value = lookup(dict, path);
    return typeof value === 'string' ? value : path;
  };

  return (
    <LocaleContext.Provider value={{ locale, dict, t }}>
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocale(): LocaleContextValue {
  const ctx = useContext(LocaleContext);
  if (!ctx) {
    throw new Error('useLocale must be used within a LocaleProvider');
  }
  return ctx;
}
