# ssr-themes [![Version](https://img.shields.io/npm/v/ssr-themes.svg?colorB=green)](https://www.npmjs.com/package/ssr-themes)

Framework-agnostic, SSR-friendly theming, with first-class React & Solid support.

- Perfect theming with no flashing
- System setting with `prefers-color-scheme`
- Themed browser UI with `color-scheme`
- SSR friendly with cookies
- Sync theme across tabs
- Strongly-typed React and Solid bindings
- 1.74 kB hydrated client bundle + 537 B inline theme bootstrap, minified and brotlied

Live demos:

- TanStack Start: [https://start.ssr-themes.cadams.io](https://start.ssr-themes.cadams.io)
- Next.js: [https://next.ssr-themes.cadams.io](https://next.ssr-themes.cadams.io)
- Solid: [https://solid.ssr-themes.cadams.io](https://solid.ssr-themes.cadams.io)

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

The API is simple:

1. `themeScript()` from `ssr-themes` runs on the client before hydration and sets the theme on `<html>`, to avoid theme flash on first render.
2. `<ThemeProvider />` from `ssr-themes/react` or `ssr-themes/solid` keeps the theme cookie + DOM in sync and exposes `useTheme()`.
3. Optionally, `themeFromCookieHeader()` + `registerTheme()` from `ssr-themes` let you pre-render the `<html>` theme during SSR.

### TanStack Start

In TanStack Start, use `ScriptOnce` for `themeScript()` (instead of `head.scripts`).

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
  registerTheme,
  themeFromCookieHeader,
  themeScript,
} from 'ssr-themes';
import {ThemeProvider} from 'ssr-themes/react';

const getInitialTheme = createServerFn({
  method: 'GET',
}).handler(() =>
  themeFromCookieHeader(getRequestHeader('cookie')),
);

export const Route = createRootRoute({
  loader: async () => ({
    initialTheme: await getInitialTheme(),
  }),
  component: RootComponent,
  // only load the theme from the cookie during SSR
  staleTime: Infinity,
  shouldReload: false,
});

function RootComponent() {
  const {initialTheme} = Route.useLoaderData();

  return (
    <html
      suppressHydrationWarning
      {...registerTheme({initialTheme})}
    >
      <head>
        <HeadContent />
      </head>
      <body>
        <ThemeProvider initialTheme={initialTheme}>
          <ScriptOnce children={themeScript()} />
          <Outlet />
        </ThemeProvider>
        <Scripts />
      </body>
    </html>
  );
}
```

### Next.js App Router

Inject `themeScript()` before hydration and wrap your app with `ThemeProvider`. In Next.js, the equivalent of TanStack's `ScriptOnce` pattern is `next/script` with `strategy="beforeInteractive"`.

Import the provider from `ssr-themes/react`; that's the React client entry and includes the `'use client'` directive.

```tsx
// app/layout.tsx
import {cookies} from 'next/headers';
import Script from 'next/script';
import type {ReactNode} from 'react';
import {registerTheme, themeScript} from 'ssr-themes';
import {ThemeProvider} from 'ssr-themes/react';
import {lightOrDarkWithSystemSchema} from 'ssr-themes/zod';

export default async function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  const themeCookie = (await cookies()).get(
    'theme',
  )?.value;
  const parsedCookie =
    lightOrDarkWithSystemSchema.safeParse(themeCookie);
  const initialTheme = parsedCookie.success
    ? parsedCookie.data
    : undefined;

  return (
    <html
      suppressHydrationWarning
      {...registerTheme({initialTheme})}
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

If you render theme-dependent UI during SSR, pass the cookie theme straight through to:

- `registerTheme({initialTheme})` on `<html>`
- `initialTheme={initialTheme}` on `<ThemeProvider />`

Passing `'system'` is fine. In that case, `registerTheme()` leaves the SSR theme attribute alone, and `themeScript()` resolves the active theme before hydration.

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

### Shared theme options

`ThemeProvider` from `ssr-themes/react` and `themeScript(options)` from `ssr-themes` share the same core theme config.
`registerTheme(options)` overlaps with `attribute`, `valueMap`, and `enableColorScheme`.

Keep overlapping options in sync. If your server HTML, bootstrap script, and hydrated provider use different theme settings, they can disagree during SSR or hydration.

- `themes`: list of theme names (default: `['dark', 'light']`)
- `defaultTheme`: fallback theme when no cookie is set (default: `'system'` when `enableSystem`, otherwise `'light'`)
- `forcedTheme`: force a page to a theme (disable your theme toggle UI when set)
- `enableSystem`: enable the `'system'` theme (default: `true`)
- `enableColorScheme`: set browser `color-scheme` when the active theme resolves to literal `light` or `dark`; custom theme names do not automatically map to a browser color scheme (default: `true`)
- `attribute`: `'class'`, a `data-*`, or an array of attributes
- `valueMap`: map theme name -> DOM attribute value; use the same mapping everywhere you write the theme to `<html>`
- `cookie`: cookie options used to persist the theme; `themeScript()` only reads `cookie.name`, so keep that in sync with `ThemeProvider`

### ssr-themes/react

React bindings for the core SSR helpers.

### ThemeProvider

Additional props:

- `initialTheme`: initial theme to use during SSR and hydration; pass the cookie value through directly, including `'system'`
- `disableTransitionOnChange`: disable CSS transitions during theme changes (default: `true`)
- `nonce`: nonce for the temporary inline style tag used when transitions are disabled

### useTheme()

Returns `{theme, setTheme, forcedTheme, resolvedTheme, colorScheme, themes}`.

- `theme`: the selected theme, including `'system'` when enabled
- `resolvedTheme`: the active resolved theme after applying system preference
- `colorScheme`: the current system preference (`'light'` or `'dark'`) when `enableSystem` is enabled
- `themes`: the available themes, plus `'system'` when `enableSystem` is enabled

### ssr-themes/solid

Solid bindings for the core SSR helpers.

### ThemeProvider

Additional props match the React binding:

- `initialTheme`: initial theme to use during SSR and hydration; pass the cookie value through directly, including `'system'`
- `disableTransitionOnChange`: disable CSS transitions during theme changes (default: `true`)
- `nonce`: nonce for the temporary inline style tag used when transitions are disabled

### useTheme()

Returns accessors plus a setter: `{theme, setTheme, forcedTheme, resolvedTheme, colorScheme, themes}`.

- call the accessors as functions, like `theme()` or `resolvedTheme()`
- `setTheme(...)` accepts either a theme value or an updater callback

### themeScript(options)

Generate the bootstrap script string, which should be inlined in a `script` tag before hydration.

It accepts the shared theme options above. Pass the same `themes`, `defaultTheme`, `forcedTheme`, `enableSystem`, `enableColorScheme`, `attribute`, `valueMap`, and `cookie.name` that your `ThemeProvider` uses.

### registerTheme(options)

Server helper that returns props to spread onto your `<html>` during SSR.

- `initialTheme`: optional theme to pre-apply on `<html>`; passing `'system'` is fine, and simply skips pre-setting the SSR theme attribute
- `attribute`: same theme attribute config used by `ThemeProvider` / `themeScript()`
- `valueMap`: same theme-to-DOM mapping used by `ThemeProvider` / `themeScript()`
- `enableColorScheme`: same browser `color-scheme` behavior used by `ThemeProvider` / `themeScript()`; only applies when the initial theme is literal `light` or `dark`
- `className`: extra classes to merge with the theme class
- `style`: extra styles to merge with the generated `colorScheme` style

### ssr-themes/zod

Tiny Zod helpers for the default cookie values used by the library.

```ts
import {cookies} from 'next/headers';
import {lightOrDarkWithSystemSchema} from 'ssr-themes/zod';

const cookie = (await cookies()).get('theme')?.value;
const initialTheme =
  lightOrDarkWithSystemSchema.safeParse(cookie).data;
```

- `lightOrDarkSchema`: parses `'light' | 'dark'`
- `lightOrDarkWithSystemSchema`: parses `'light' | 'dark' | 'system'`
