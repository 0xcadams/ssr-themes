# ssr-themes [![Version](https://img.shields.io/npm/v/ssr-themes.svg?colorB=green)](https://www.npmjs.com/package/ssr-themes)

Theming is hard with SSR.

The server is usually unaware of client theme preference. This skew between what the server defaults to and what is hydrated on the client will commonly result in a flash of the wrong content.

`ssr-themes` keeps the server HTML, bootstrap script, and hydrated app in sync. It uses cookies to store the correct theme (including the browser's system theme) and has first-party bindings for React, Svelte, Vue, and more. This means:

- ✨ No flash on first paint
- 🍪 Cookie-driven SSR for correct SSR markup
- 🌓 System theme support
- 🔄 Built-in cross-tab sync
- 🛡️ Strongly typed bindings

See the live demo: [https://ssr-themes.cadams.io/](https://ssr-themes.cadams.io/).

![Demo of ssr themes not flashing](./.github/ssr-theme.gif)

## Install

```bash
bun add ssr-themes
# or
pnpm add ssr-themes
# or
npm install ssr-themes
# or
yarn add ssr-themes
```

## How It Works

`ssr-themes` has three parts:

1. `themeFromCookieHeader()` and `registerTheme()` help the server pre-render the correct theme during SSR. This is optional.
2. `themeScript()` runs before hydration on the client and makes sure the theme on `<html>` is set to the correct value (and fills in the value from the client if it's `system`).
3. `ThemeProvider` keeps the DOM, the theme cookie, and client state in sync after mount.

```tsx
import {
  registerTheme,
  themeFromCookieHeader,
  themeScript,
} from 'ssr-themes';
import {ThemeProvider} from 'ssr-themes/react';

const themeState = themeFromCookieHeader(cookieHeader);

// `suppressHydrationWarning` tells React to ignore differences
// between client and server. This diff happens when the theme is
// `system` and the server doesn't know what that will resolve
// to on the client
<html
  suppressHydrationWarning
  {...registerTheme(themeState)}
>
  <head>
    <script id="ssr-themes">{themeScript()}</script>
  </head>
  <body>
    <ThemeProvider
      // Keep the logical theme choice for hydration and UI.
      // `registerTheme(themeState)` already uses `appliedTheme`
      // when it can pre-render <html>.
      selectedTheme={themeState?.selectedTheme}
    >
      {children}
    </ThemeProvider>
  </body>
</html>;
```

## Why not `next-themes`?

`next-themes` is popular because it makes client-side theming in React and Next.js easy.

But it solves a different problem.

Its docs explicitly warn that reading `theme` before mount is hydration-unsafe, because the server does not know the current theme yet. That is a reasonable tradeoff if all you need is client-resolved theme state.

`ssr-themes` is for apps that want the theme to participate in SSR.

It gives you helpers to:

- Read the theme from the request cookie during SSR
- Pre-render the correct `<html>` attributes on the server
- Apply the same theme before hydration

If you only need client-side theme state in a Next.js app, `next-themes` is a good fit.

If you don't use Next.js or your SSR markup depends on the theme, `ssr-themes` is a good fit.

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

All examples in this repo use Tailwind v4 with class-based dark mode - feel free to check them out for more detail:

```css
@import 'tailwindcss';
@custom-variant dark (&:where(.dark, .dark *));
```

## API

The API is split into two parts:

- Core SSR helpers from `ssr-themes`
- Framework bindings from `ssr-themes/react`, `ssr-themes/solid`, `ssr-themes/vue`, and `ssr-themes/svelte`

These also have shared option types for easier configuration.

### Shared Types

`themeScript()` and `ThemeProvider` use the same core theme options.

- `themes`: list of available theme names. By default the library uses `dark` and `light`.
- `defaultTheme`: theme to use when no cookie is set. Defaults to `'system'` when `enableSystem` is enabled, otherwise `'light'`.
- `forcedTheme`: force the current page to a specific theme. Disable your theme switcher UI when this is set.
- `enableSystem`: enable the `'system'` theme. Defaults to `true`.
- `enableColorScheme`: set browser `color-scheme` when the resolved theme is literal `light` or `dark`. Defaults to `true`.
- `attribute`: where the theme is written on `<html>`. Accepts `class`, a `data-*` attribute, or an array of attributes.
- `valueMap`: map a theme name to a different DOM value.
- `cookie`: configure the cookie used to persist the theme. This includes `name`, `path`, `maxAge`, `expires`, `sameSite`, `domain`, and `secure`. Make sure the cookie is available to SSR.

> ⚠️ If `themes`, `attribute`, `valueMap`, or `cookie.name` differ between your server HTML, bootstrap script, and hydrated provider, they can disagree during SSR or hydration.

### SSR Helpers

#### `themeScript()`

Use `themeScript()` to generate the inline bootstrap script that runs on the client before hydration.

This script reads the saved theme from the cookie, resolves `'system'` when needed, updates the `<html>` attributes, and sets `color-scheme` when appropriate. This is what prevents the initial flash.

Pass the same theme options here that you pass to `ThemeProvider`. If these differ, the server HTML, bootstrap script, and hydrated app can disagree.

### Framework Bindings

#### `ThemeProvider`

`ThemeProvider` keeps theme state in sync after hydration.

It updates `<html>`, writes the selected theme to a cookie, reacts to system theme changes, and syncs theme changes across tabs.

- React: `import {ThemeProvider} from 'ssr-themes/react'`
- Solid: `import {ThemeProvider} from 'ssr-themes/solid'`
- Vue: `import {ThemeProvider} from 'ssr-themes/vue'`
- Svelte: `import {ThemeProvider} from 'ssr-themes/svelte'`

Each binding accepts the shared theme options below, plus these additional props:

- `selectedTheme`: logical theme choice for hydration and UI state. Pass `themeState?.selectedTheme` through directly, including `'system'`.
- `disableTransitionOnChange`: disable CSS transitions during theme changes. Defaults to `true`.
- `nonce`: CSP nonce for the temporary inline style used when transitions are disabled.

#### `useTheme()` & `getTheme()`

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

### `themeFromCookieHeader()`

Use `themeFromCookieHeader()` during SSR to read the saved theme
from a raw `Cookie` header.

This is the simplest way to make the current theme available to
server-rendered HTML. It returns `undefined` when the cookie is
missing, empty, malformed, or not in the allowed theme list.

When present, the return value has:

- `selectedTheme`: the logical theme choice stored by the app
- `appliedTheme`: the literal theme that should be applied
  to `<html>` during SSR

The cookie stores explicit themes as-is and stores system mode in a
compact form with the last resolved hint, such as `~d` or `~l`.

Pass the full `themeState` object to `registerTheme()` so SSR can use
`appliedTheme`, and pass `themeState?.selectedTheme` to
`ThemeProvider` so hydrated UI keeps the logical theme choice.

- `cookieName`: cookie name to read. Defaults to `'theme'`.
- `enableSystem`: whether `'system'` is allowed. Defaults to `true`.
- `themes`: optional list of allowed theme names for validation.

### `registerTheme()`

Use `registerTheme()` to pre-render the current theme on `<html>` during SSR.

By default it returns JSX-friendly props you can spread onto `<html>`. Pass `renderMode: 'html-string'` when your framework needs a serialized attribute string instead.

```tsx
const htmlProps = registerTheme({
  selectedTheme: 'dark',
});
// { className: 'dark' }

const htmlAttributes = registerTheme({
  selectedTheme: 'dark',
  renderMode: 'html-string',
});
// `class="dark"`
```

If `selectedTheme` is `undefined` or `'system'`, the function does not pre-set a resolved theme on `<html>` unless you also pass `appliedTheme`. That lets the client bootstrap script, `themeScript()`, resolve the final theme before hydration.

Because `themeFromCookieHeader()` returns `selectedTheme`
and `appliedTheme`, you can pass its return value directly to
`registerTheme()`.

The configuration options are:

- `selectedTheme`: logical theme choice for SSR and hydration.
- `appliedTheme`: literal theme to pre-apply to `<html>`. Use this when `selectedTheme` is `'system'` but the server has a resolved hint or a forced theme.
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
