import {
  defaultVariant,
  encodeVariant,
  parseThemeCookie,
} from './src/lib/theme';

export const config = {
  matcher: ['/'],
};

export default function middleware(request: Request) {
  const url = new URL(request.url);
  const variant =
    encodeVariant(
      parseThemeCookie(request.headers.get('cookie')),
    ) ?? defaultVariant;

  url.pathname = `/theme/${encodeURIComponent(variant)}`;

  return Response.redirect(url, 307);
}
