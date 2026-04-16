# App Router Minimal Migration

Use this mode for the simplest migration path.

## Goal

Replace `next-themes` with `ssr-themes` using:

- shared theme config
- `themeScript()`
- bound `ThemeProvider`
- bound `useTheme()`

Do not add server cookie reads or `registerTheme()`.

## 1. Replace the dependency

- remove `next-themes`
- add `ssr-themes`

Keep the project's existing package manager and the
rest of the dependency graph unchanged.

## 2. Add a shared theme module

Create `app/theme.ts` when one does not already exist.

Example:

```ts
import {createTheme} from 'ssr-themes';

export const theme = createTheme({
  attribute: 'class',
  defaultTheme: 'system',
  enableSystem: true,
});

export const {themeScript} = theme;
```

Preserve any existing behavior from the old
`next-themes` provider:

- `themes`
- `attribute`
- `defaultTheme`
- `enableSystem`
- `enableColorScheme`
- `value` -> `valueMap`
- `storageKey` -> `cookie.name`

## 3. Replace the old provider wrapper

If the project has a client-only `theme-provider.tsx`
whose only job is to wrap `next-themes`, delete it and
bind the provider from the shared theme instead.

In the layout module:

```tsx
import type {Metadata} from 'next';
import Script from 'next/script';
import type {ReactNode} from 'react';
import {bindTheme} from 'ssr-themes/react';

import {theme, themeScript} from './theme';

const {ThemeProvider} = bindTheme(theme);
```

Then wire the layout like this:

```tsx
<html lang="en" suppressHydrationWarning>
  <head>{/* keep existing head content */}</head>
  <body>
    <Script
      id="ssr-themes"
      strategy="beforeInteractive"
    >
      {themeScript()}
    </Script>
    <ThemeProvider>{children}</ThemeProvider>
  </body>
</html>
```

Notes:

- Keep existing fonts and unrelated `<head>` content.
- Keep existing body classes and styling.
- Preserve any previous `scriptProps`, including `nonce`
  or `data-*`, on the new `<Script>`.
- If the app used a forced theme, pass the same value to
  both `themeScript({forced})` and
  `<ThemeProvider forced={forced}>`.
- If CSP requires a nonce for transition-disabling
  styles, also pass `nonce` to
  `<ThemeProvider nonce={nonce}>`.
- Do not add `next/headers`, `parseThemeCookie()`,
  `registerTheme()`, or `initial` in minimal mode.

## 4. Convert client components

Replace `next-themes` imports:

```tsx
import {useTheme} from 'next-themes';
```

with:

```tsx
import {bindTheme} from 'ssr-themes/react';

import {theme} from './theme';

const {useTheme} = bindTheme(theme);
```

Then replace `theme` and `setTheme(...)` with
`selected` and `setSelected(...)`.

Example:

```tsx
const {selected, setSelected, forced, themes} =
  useTheme();

const value = selected ?? themes[0]!;

<select
  value={value}
  onChange={event =>
    setSelected(
      event.target.value as (typeof themes)[number],
    )
  }
  disabled={Boolean(forced)}
>
  {themes.map(themeName => (
    <option key={themeName} value={themeName}>
      {themeName}
    </option>
  ))}
</select>;
```

Use `themes` for the option list instead of hardcoding
`light`, `dark`, and `system` unless the existing app
really uses only those values.

## 5. Remove `mounted` guards

If a component only waited for mount because
`next-themes` could not safely expose `theme` during
SSR, remove:

- the `mounted` state
- the `useEffect` that flips it to `true`
- the mount-only placeholder branch

Keep any mounted logic that serves some other purpose.

## 6. Update copy only where needed

If the app copy explicitly says `next-themes`, rewrite
that text to describe `ssr-themes` instead. Do not
rename the project or change unrelated branding.

## 7. Verify

Run the checks in
[verification.md](verification.md).

Expected result for minimal mode:

- theme changes apply before hydration via
  `themeScript()`
- the picker no longer waits for mount
- the raw server HTML still does not pre-render the
  selected theme
