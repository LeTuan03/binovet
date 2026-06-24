import { NextRequest, NextResponse } from 'next/server';
import { locales, defaultLocale, isLocale } from '@/lib/i18n/config';

function preferredLocale(req: NextRequest): string {
  const cookie = req.cookies.get('NEXT_LOCALE')?.value;
  if (isLocale(cookie)) return cookie;
  const accept = req.headers.get('accept-language')?.toLowerCase() ?? '';
  if (accept.startsWith('en')) return 'en';
  return defaultLocale;
}

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const hasLocale = locales.some(
    (l) => pathname === `/${l}` || pathname.startsWith(`/${l}/`),
  );
  if (hasLocale) return NextResponse.next();

  const locale = preferredLocale(req);
  const url = req.nextUrl.clone();
  url.pathname = `/${locale}${pathname === '/' ? '' : pathname}`;
  return NextResponse.redirect(url);
}

export const config = {
  // Skip API, admin panel, Next internals, static assets and files with extensions.
  matcher: [
    '/((?!api|admin|_next/static|_next/image|images|uploads|favicon.ico|robots.txt|sitemap.xml|.*\\..*).*)',
  ],
};
