# ssr-themes [![Version](https://img.shields.io/npm/v/ssr-themes.svg?colorB=green)](https://www.npmjs.com/package/ssr-themes)

Theming gets hard once SSR is involved.

If the server renders one theme, the browser prefers another, and hydration fixes it later, users see a flash of the wrong content. Client-only libraries don't fix this problem, because the server needs to be aware of the theme.

`ssr-themes` keeps the server HTML, the bootstrap script, and the hydrated app in sync. It uses cookies to store the current theme and comes with first-party bindings for React, Solid, Svelte, and Vue.

- No flash on first paint
- Cookie-backed SSR
- System theme support
- `color-scheme` support
- Cross-tab sync
- Strongly typed bindings

See a live demo: [https://ssr-themes.cadams.io/](https://ssr-themes.cadams.io/).

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

## How It Works

`ssr-themes` has three pieces:

1. `themeFromCookieHeader()` and `registerTheme()` let the server pre-render the current theme during SSR.
2. `themeScript()` runs before hydration on the client and makes sure the theme on `<html>` is correct.
3. `ThemeProvider` keeps the DOM, the theme cookie, and client state in sync after mount.

Passing `'system'` on the server is fine. In that case, the server does not try to guess whether the browser will resolve to light or dark. `themeScript()` resolves it before hydration.

```tsx
import {
  registerTheme,
  themeFromCookieHeader,
  themeScript,
} from 'ssr-themes';
import {ThemeProvider} from 'ssr-themes/react';

const initialTheme =
  themeFromCookieHeader(cookieHeader);

<html
  suppressHydrationWarning
  {...registerTheme({initialTheme})}
>
  <head>
    <script id="ssr-themes">{themeScript()}</script>
  </head>
  <body>
    <ThemeProvider initialTheme={initialTheme}>
      {children}
    </ThemeProvider>
  </body>
</html>;
```

## Why Not `next-themes`?

`next-themes` is popular because it makes client-side theming in React and Next.js easy.

But it solves a different problem.

Its docs explicitly warn that reading `theme` before mount is hydration-unsafe, because the server does not know the current theme yet. That is a reasonable tradeoff if all you need is client-resolved theme state.

`ssr-themes` is for apps that want the theme to participate in SSR.

It gives you helpers to:

- Read the theme from the request cookie during SSR
- Pre-render the correct `<html>` attributes on the server
- Apply the same theme before hydration

If you only need client-side theme state in a React or Next.js app, `next-themes` is a good fit.

If your SSR markup depends on the theme, or you don't use Next.js, `ssr-themes` is a good fit.

## Styling

### Class-Based Theming

By default, `ssr-themes` writes a class to `<html>`.

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

If you prefer `data-*` attributes, set `attribute` accordingly.

### Tailwind CSS

All examples in this repo use Tailwind v4 with class-based dark mode - feel free to check those out for more information. Integration with Tailwind is as simple as:

```css
@import 'tailwindcss';
@custom-variant dark (&:where(.dark, .dark *));
```

## API

There are two kinds of APIs in `ssr-themes`:

- Core SSR helpers from `ssr-themes`
- Framework bindings from `ssr-themes/react`, `ssr-themes/solid`, `ssr-themes/vue`, and `ssr-themes/svelte`

### `themeScript(options)`

Use `themeScript()` to generate the inline bootstrap script that runs before hydration.

This script reads the saved theme, resolves `'system'` when needed, updates the `<html>` attributes, and sets `color-scheme` when appropriate. This is what prevents the initial flash.

Pass the same theme options here that you pass to `ThemeProvider`. If these differ, the server HTML, bootstrap script, and hydrated app can disagree.

### `ThemeProvider`

Use `ThemeProvider` to keep theme state in sync after hydration.

It updates `<html>`, writes the selected theme to a cookie, reacts to system theme changes, and syncs theme changes across tabs.

- React: `import {ThemeProvider} from 'ssr-themes/react'`
- Solid: `import {ThemeProvider} from 'ssr-themes/solid'`
- Vue: `import {ThemeProvider} from 'ssr-themes/vue'`
- Svelte: `import {ThemeProvider} from 'ssr-themes/svelte'`

Each binding accepts the shared theme options below, plus these additional props:

- `initialTheme`: theme to use during SSR and hydration. Pass the cookie value through directly, including `'system'`.
- `disableTransitionOnChange`: disable CSS transitions during theme changes. Defaults to `true`.
- `nonce`: CSP nonce for the temporary inline style used when transitions are disabled.

### Shared Theme Options

`themeScript()` and every `ThemeProvider` use the same core theme options. Keep overlapping options in sync.

If `themes`, `attribute`, `valueMap`, or `cookie.name` differ between your server HTML, bootstrap script, and hydrated provider, they can disagree during SSR or hydration.

- `themes`: list of available theme names. By default the library uses `dark` and `light`.
- `defaultTheme`: theme to use when no cookie is set. Defaults to `'system'` when `enableSystem` is enabled, otherwise `'light'`.
- `forcedTheme`: force the current page to a specific theme. Disable your theme switcher UI when this is set.
- `enableSystem`: enable the `'system'` theme. Defaults to `true`.
- `enableColorScheme`: set browser `color-scheme` when the resolved theme is literal `light` or `dark`. Defaults to `true`.
- `attribute`: where the theme is written on `<html>`. Accepts `class`, a `data-*` attribute, or an array of attributes.
- `valueMap`: map a theme name to a different DOM value.
- `cookie`: configure the cookie used to persist the theme. This includes `name`, `path`, `maxAge`, `expires`, `sameSite`, `domain`, and `secure`. Make sure the cookie is available to SSR.

### `useTheme()` And `getTheme()`

Use these helpers to read and update the current theme from your application code.

- React: `useTheme()` from `ssr-themes/react`
- Solid: `useTheme()` from `ssr-themes/solid`
- Vue: `useTheme()` from `ssr-themes/vue`
- Svelte: `getTheme()` from `ssr-themes/svelte`

All bindings expose the same core theme state:

- `theme`: the selected theme. This can be `'system'` when system support is enabled.
- `setTheme(next)`: update the current theme and persist it to the cookie. Accepts a theme value or an updater callback.
- `forcedTheme`: the forced theme for the current page, if any.
- `resolvedTheme`: the active literal theme after `'system'` has been resolved.
- `colorScheme`: the current OS preference, `'light'` or `'dark'`, when system support is enabled.
- `themes`: the list of available themes, plus `'system'` when `enableSystem` is enabled.

### `themeFromCookieHeader(cookieHeader, options)`

Use `themeFromCookieHeader()` during SSR to read the saved theme
from a raw `Cookie` header.

This is the simplest way to make the current theme available to
server-rendered HTML. It returns `undefined` when the cookie is
missing, empty, malformed, or not in the allowed theme list.

Options:

- `cookieName`: cookie name to read. Defaults to `'theme'`.
- `themes`: optional list of allowed theme names for validation.

### `registerTheme(options)`

Use `registerTheme()` to pre-render the current theme on `<html>` during SSR.

By default it returns JSX-friendly props you can spread onto `<html>`. Pass `renderMode: 'html-string'` when your framework needs a serialized attribute string instead.

If `initialTheme` is `undefined` or `'system'`, the function does not pre-set a resolved theme on `<html>`. That lets the bootstrap script resolve the final theme before hydration.

```tsx
const htmlProps = registerTheme({
  initialTheme: 'dark',
});
// { className: 'dark' }

const htmlAttributes = registerTheme({
  initialTheme: 'dark',
  renderMode: 'html-string',
});
// `class="dark"`
```

Options:

- `initialTheme`: resolved or system theme to pre-apply to `<html>`.
- `renderMode`: output format. Defaults to `'jsx'`. Use `'html-string'` for template-based SSR such as SvelteKit `app.html`.
- `attribute`: same attribute config used by `ThemeProvider` and
  `themeScript()`.
- `valueMap`: same theme-to-DOM mapping used elsewhere.
- `enableColorScheme`: same browser `color-scheme` behavior used
  elsewhere.
- `className`: extra classes to merge with the generated theme
  class.
- `style`: extra inline styles to merge with the generated
  `color-scheme` style.

### `ssr-themes/zod`

`ssr-themes/zod` exports small Zod helpers for validating the
default cookie values used by the library.

```ts
import {cookies} from 'next/headers';
import {lightOrDarkWithSystemSchema} from 'ssr-themes/zod';

const cookie = (await cookies()).get('theme')?.value;
const initialTheme =
  lightOrDarkWithSystemSchema.safeParse(cookie).data;
//       ^ 'light' | 'dark' | 'system'
```
