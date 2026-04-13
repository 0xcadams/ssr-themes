import {
  type NextRequest,
  NextResponse,
} from 'next/server';

import {
  defaultVariant,
  encodeVariant,
  parseThemeCookie,
} from './app/theme';

export function proxy(request: NextRequest) {
  const variant =
    encodeVariant(
      parseThemeCookie(request.headers.get('cookie')),
    ) ?? defaultVariant;
  const url = request.nextUrl.clone();

  url.pathname = `/theme/${encodeURIComponent(variant)}`;

  return NextResponse.rewrite(url);
}

export const config = {
  matcher: ['/'],
};
