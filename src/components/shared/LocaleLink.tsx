"use client";

import React from 'react';
import Link from 'next/link';
import { localePath } from '@/lib/i18n/config';
import { useLocale } from '@/lib/i18n/LocaleProvider';

type LocaleLinkProps = Omit<React.ComponentProps<typeof Link>, 'href'> & {
  href: string;
};

/**
 * Drop-in replacement for next/link that automatically prefixes the active
 * locale. Use inside client components; server components can call
 * `localePath(locale, href)` directly with a plain <Link>.
 */
export default function LocaleLink({ href, ...rest }: LocaleLinkProps) {
  const { locale } = useLocale();
  return <Link href={localePath(locale, href)} {...rest} />;
}
