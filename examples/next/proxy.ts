import {
  type NextRequest,
  NextResponse,
} from 'next/server';

import {
  defaultThemeVariant,
  encodeTheme,
  themeFromCookieHeader,
} from './app/theme';

export function proxy(request: NextRequest) {
  const variant =
    encodeTheme(
      themeFromCookieHeader(
        request.headers.get('cookie'),
      ),
    ) ?? defaultThemeVariant;
  const url = request.nextUrl.clone();

  url.pathname = `/theme/${encodeURIComponent(variant)}`;

  return NextResponse.rewrite(url);
}

export const config = {
  matcher: ['/'],
};
