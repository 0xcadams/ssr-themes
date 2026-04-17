# App Router Maximal Migration

Use this mode when the server must participate in the
active theme.

## Goal

Add the full SSR-aware flow:

- shared theme config
- `parseThemeCookie()`
- `registerTheme()`
- `themeScript()`
- bound `ThemeProvider`
- `<ThemeProvider initial={initial}>`

## 1. Start from the minimal migration

Apply the same dependency replacement, shared
`app/theme.ts`, hook conversion, and copy cleanup as in
[app-router-minimal.md](app-router-minimal.md).

Then add the SSR-specific pieces below.

## 2. Export the SSR helpers from `app/theme.ts`

Example:

```ts
import {createTheme} from 'ssr-themes';

export const theme = createTheme({
  attribute: 'class',
  defaultTheme: 'system',
  enableSystem: true,
});

export const {
  parseThemeCookie,
  registerTheme,
  themeScript,
} = theme;
```

Preserve the old provider behavior the same way as in
the minimal path.

## 3. Read the cookie in the App Router layout

In the layout module, add the server-side read:

```tsx
import type {Metadata} from 'next';
import {headers} from 'next/headers';
import Script from 'next/script';
import type {ReactNode} from 'react';
import {bindTheme} from 'ssr-themes/react';

import {
  parseThemeCookie,
  registerTheme,
  theme,
  themeScript,
} from './theme';

const {ThemeProvider} = bindTheme(theme);

type RootLayoutProps = {
  children: ReactNode;
};

export default async function RootLayout({
  children,
}: RootLayoutProps) {
  const cookieHeader =
    (await headers()).get('cookie') ?? '';
  const initial = parseThemeCookie(cookieHeader);

  return (
    <html lang="en" {...registerTheme(initial)}>
      <head>{/* keep existing head content */}</head>
      <body>
        <Script
          id="ssr-themes"
          strategy="beforeInteractive"
        >
          {themeScript()}
        </Script>
        <ThemeProvider initial={initial}>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
```

## 4. Use SSR state only where it adds value

- Keep client components on `useTheme()`.
- Use `initial` only to keep SSR and hydration aligned.
- If server-rendered UI depends on theme state, derive
  it from `initial` during SSR.
- Make the layout `async` when using `await headers()`.
- Preserve any previous `scriptProps`, including
  `nonce` or `data-*`, on the new `<Script>`.
- If the app used a forced theme, pass the same value to
  `registerTheme(initial, {forced})`,
  `themeScript({forced})`, and
  `<ThemeProvider initial={initial} forced={forced}>`.
- If CSP requires a nonce for transition-disabling
  styles, also pass `nonce` to
  `<ThemeProvider nonce={nonce}>`.

## 5. Know the tradeoff

This mode is more invasive than the minimal path.
Reading request headers in the layout can affect route
cacheability in App Router.

SSR can only use theme information the server actually
has. If there is no theme cookie yet, first paint still
depends on `themeScript()` before hydration.

Do not refactor to the advanced cache-friendly
`proxy.ts` plus `[variant]` route architecture unless
the user explicitly asks for that pattern.

## 6. Verify

Run the checks in
[verification.md](verification.md).

Expected result for maximal mode:

- when a valid theme cookie exists, the current theme is
  present in SSR html props
- when a valid theme cookie exists, theme-aware UI can
  be correct on first render
- hydration reuses the same initial theme state
