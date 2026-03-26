# ssr-themes [![Version](https://img.shields.io/npm/v/ssr-themes.svg?colorB=green)](https://www.npmjs.com/package/ssr-themes)

Themes for your React app.

- Perfect dark mode with no flashing
- System setting with `prefers-color-scheme`
- Themed browser UI with `color-scheme`
- SSR friendly (cookie based)
- Sync theme across tabs
- Typed `useTheme` hook
- 1.74 kB hydrated client bundle + 537 B inline theme bootstrap, minified and brotlied

Live demos:

- TanStack Start: [https://start.ssr-themes.cadams.io](https://start.ssr-themes.cadams.io)
- Next.js: [https://next.ssr-themes.cadams.io](https://next.ssr-themes.cadams.io)

## Install

```bash
npm install ssr-themes
# or
bun add ssr-themes
# or
pnpm add ssr-themes
# or
yarn add ssr-themes
```

## Quickstart

There are two pieces:

1. `themeScript()` runs before hydration and sets the theme on `<html>`.
2. `<ThemeProvider />` keeps the theme cookie + DOM in sync and exposes `useTheme()`.

### TanStack Start

In TanStack Start, prefer `ScriptOnce` for `themeScript()` instead of `head.scripts`.

```tsx
// src/routes/__root.tsx
import {
  HeadContent,
  Outlet,
  ScriptOnce,
  Scripts,
  createRootRoute,
} from '@tanstack/react-router';
import {createServerFn} from '@tanstack/react-start';
import {getRequestHeader} from '@tanstack/react-start/server';
import {
  ThemeProvider,
  type ThemeName,
  type SystemTheme,
} from 'ssr-themes';
import {
  registerTheme,
  themeFromCookieHeader,
  themeScript,
} from 'ssr-themes/server';

type InitialTheme = ThemeName<SystemTheme>;

const getInitialTheme = createServerFn({
  method: 'GET',
}).handler(() =>
  themeFromCookieHeader<SystemTheme>(
    getRequestHeader('cookie'),
  ),
);

function RootComponent() {
  const {initialTheme} = Route.useLoaderData();
  const theme =
    initialTheme && initialTheme !== 'system'
      ? initialTheme
      : undefined;

  return (
    <html
      lang="en"
      suppressHydrationWarning
      {...registerTheme({theme})}
    >
      <head>
        <HeadContent />
      </head>
      <body>
        <ThemeProvider
          attribute="class"
          initialTheme={initialTheme as InitialTheme}
        >
          <ScriptOnce
            children={themeScript({
              attribute: 'class',
            })}
          />
          <Outlet />
        </ThemeProvider>
        <Scripts />
      </body>
    </html>
  );
}

export const Route = createRootRoute({
  loader: async () => ({
    initialTheme: await getInitialTheme(),
  }),
  staleTime: Infinity,
  shouldReload: false,
  component: RootComponent,
});
```

### Next.js App Router

Inject `themeScript()` before hydration and wrap your app with `ThemeProvider`.
In Next.js, the equivalent of TanStack's `ScriptOnce` pattern is `next/script` with `strategy="beforeInteractive"`.

In Server Components, import the provider from `ssr-themes/client` so it doesn't resolve to the `react-server` export.

```tsx
// app/layout.tsx
import {cookies} from 'next/headers';
import Script from 'next/script';
import type {ReactNode} from 'react';
import {ThemeProvider} from 'ssr-themes/client';
import {
  registerTheme,
  themeScript,
} from 'ssr-themes/server';

export default async function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  const cookieStore = await cookies();
  const themeCookie = cookieStore.get('theme')?.value;
  const initialTheme =
    themeCookie === 'dark' ||
    themeCookie === 'light' ||
    themeCookie === 'system'
      ? themeCookie
      : undefined;
  const theme =
    initialTheme === 'dark' || initialTheme === 'light'
      ? initialTheme
      : undefined;

  return (
    <html
      suppressHydrationWarning
      {...registerTheme({theme})}
    >
      <head>
        <Script
          id="ssr-themes"
          strategy="beforeInteractive"
        >
          {themeScript()}
        </Script>
      </head>
      <body>
        <ThemeProvider initialTheme={initialTheme}>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
```

If you render theme-dependent UI during SSR, pass the cookie theme to `initialTheme` and the resolved non-`system` theme to:

- `registerTheme({theme})` on `<html>`
- `initialTheme={initialTheme}` on `<ThemeProvider />`

## Styling

### Class-based theming (default)

By default, `ssr-themes` writes a class to your `<html>` element:

```css
:root {
  --background: white;
  --foreground: black;
}

:root.dark {
  --background: black;
  --foreground: white;
}
```

### TailwindCSS

All examples use Tailwind v4 with a class-based dark mode.

```css
@import 'tailwindcss';
@custom-variant dark (&:where(.dark, .dark *));
```

## API

### ThemeProvider

Common props:

- `themes`: list of theme names (default: `['dark', 'light']`)
- `defaultTheme`: default theme name (default: `'system'` when `enableSystem`)
- `forcedTheme`: force a page to a theme (disable your theme toggle UI when set)
- `enableSystem`: enable the `'system'` theme (default: `true`)
- `enableColorScheme`: set CSS `color-scheme` on `<html>` (default: `true`)
- `attribute`: `'class'`, a `data-*`, or an array of attributes
- `value`: map theme name -> DOM attribute value
- `cookie`: cookie options (name/path/maxAge/etc.)
- `initialTheme`: theme name to use during server rendering
- `disableTransitionOnChange`: disable CSS transitions during theme changes (default: `true`)
- `nonce`: nonce for CSP headers (used when transitions are disabled)

### useTheme()

Returns `{theme, setTheme, forcedTheme, resolvedTheme, systemTheme, themes}`.

### themeScript(options)

Generate the bootstrap script string, which is minified and should be inlined in a `script` tag before hydration.

### registerTheme(options)

Server helper that returns props to spread onto your `<html>` when doing SSR w/ reading cookies.
