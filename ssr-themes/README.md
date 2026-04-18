# ssr-themes [![Version](https://img.shields.io/npm/v/ssr-themes.svg?colorB=green)](https://www.npmjs.com/package/ssr-themes)

Theming is hard with SSR.

The server is usually unaware of the client theme. This skew between the server default and what is hydrated on the client often results in a flash of the wrong content.

`ssr-themes` keeps the server HTML, bootstrap script, and hydrated app in sync. It uses cookies to store the selected theme + browser default and has first-party bindings for React, Svelte, Vue, and more. This means:

- ✨ No flash on first paint
- 🍪 Cookie-driven SSR for correct SSR markup
- 🌓 System theme support
- 🔄 Built-in cross-tab sync
- 🛡️ Strongly typed bindings

![Demo of ssr-themes not flashing vs next-themes](https://raw.githubusercontent.com/0xcadams/ssr-themes/main/.github/ssr-theme.gif)

See the live demo: [https://ssr-themes.cadams.io/](https://ssr-themes.cadams.io/).

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

1. `parseThemeCookie()` and `registerTheme()` help the server pre-render the correct theme during SSR. **This is optional.**
2. `themeScript()` runs before hydration on the client and makes sure the theme on `<html>` is set to the correct value (and fills in the value from the client if it's `system`).
3. `ThemeProvider` keeps the DOM, the theme cookie, and client state in sync after mount.

```tsx
import {createTheme} from 'ssr-themes';
import {bindTheme} from 'ssr-themes/react';

const {
  options,
  registerTheme,
  parseThemeCookie,
  themeScript,
} = createTheme();

const {ThemeProvider} = bindTheme(options);

const App = () => {
  // Remove `parseThemeCookie()` and `registerTheme()` to drive theme by client script only
  // Similar to `next-themes`, this will then trigger server/client mismatch in React
  // and you should pass `suppressHydrationWarning`
  const initial = parseThemeCookie(cookieHeader);

  return (
    <html {...registerTheme(initial)}>
      <head>
        <script id="ssr-themes">
          {themeScript()}
        </script>
      </head>
      <body>
        <ThemeProvider initial={initial}>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
};
```

## Why not `next-themes`?

`next-themes` is popular because it makes client-side theming in React and Next.js easy.

But it solves a subset of the theming problem.

Its docs explicitly warn that reading `theme` before mount is hydration-unsafe, because the server does not know the current theme yet. That is a reasonable tradeoff if all you need is client-resolved theme state.

`ssr-themes` is for apps that want the theme to participate on the server. You can:

- Read the theme from the request cookie during SSR
- Pre-render the correct HTML on the server (`<select>`, etc.)

You don't even _need_ to use the SSR helpers. They are optional if/when you need to start rendering conditional UI based on the theme. You'll probably do this with a theme picker.

If you only need client-side theme state in a Next.js app, `next-themes` is a good fit.

If your SSR markup depends on the theme or you don't use Next.js, `ssr-themes` is a good fit.

> Check out the [Next.js example](https://github.com/0xcadams/ssr-themes/tree/main/examples/next) for a cache-friendly App Router setup. It uses `proxy.ts` plus `listVariants()` so the public `/` route stays cacheable and layouts do not read cookies.

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

The API has two entrypoints:

- `createTheme()` from `ssr-themes`
- `bindTheme()` from `ssr-themes/react`, `ssr-themes/solid`, `ssr-themes/vue`, or `ssr-themes/svelte`

The core theme state uses three fields:

- `selected`: the saved theme preference
- `resolved`: the concrete theme applied to the document
- `system`: the browser's current light/dark preference

### `createTheme()`

Use `createTheme()` once to define the shared theme config for your app.

```ts
import {createTheme} from 'ssr-themes';

const theme = createTheme({
  themes: ['light', 'dark', 'quartz'],
  defaultTheme: 'system',
  attribute: ['class', 'data-theme'],
  valueMap: {
    light: 'day',
    dark: 'night',
    quartz: 'quartz',
  },
  cookie: {
    name: 'theme',
    secure: true,
    sameSite: 'lax',
  },
});
```

`createTheme()` accepts stable app-level config such as:

- `themes` - the allowed theme names
- `defaultTheme` - the fallback selected theme when no saved preference exists
- `enableSystem` - whether `'system'` is a selectable theme
- `enableColorScheme` - whether to set CSS `color-scheme` for resolved `'light'` and `'dark'`
- `attribute` - where the active theme is written on `<html>`, such as `'class'`, `'data-theme'`, or both
- `valueMap` - maps theme names to the DOM values written to those attributes
- `cookie` - how the selected theme is persisted, including `name`, `path`, `maxAge`, `expires`, `sameSite`, `domain`, and `secure`

It returns:

- `options` - the exact config object passed to `createTheme()`
- `defaultVariant` - the fallback serialized variant for this config
- `encodeVariant()` - serializes theme state into a stable variant string
- `decodeVariant()` - decodes a variant string back into resolved theme state
- `listVariants()` - returns the finite set of valid pre-renderable variants
- `parseThemeCookie()` - reads theme state from a raw `Cookie` header
- `registerTheme()` - returns SSR attributes for `<html>`
- `themeScript()` - returns the inline bootstrap script that applies the theme before hydration

### `bindTheme()`

Use `bindTheme()` in the framework entrypoint for your app.

```ts
import {bindTheme} from 'ssr-themes/react';

const {ThemeProvider, useTheme} = bindTheme(theme);
// or: bindTheme(theme.options)
```

`bindTheme()` accepts either:

- the full object returned by `createTheme()`
- `theme.options`

It returns:

- `ThemeProvider`
- `useTheme()`

`ThemeProvider` only takes runtime props:

- `initial` - SSR theme state to reuse during hydration
- `forced` - force a concrete theme for the current render or page
- `disableTransition` - disable CSS transitions while the theme changes
- `nonce` - CSP nonce for inline style elements

`useTheme()` must be used within `ThemeProvider`.

All bindings expose the same conceptual state:

- `themes`
- `selected`
- `setSelected(next)`
- `forced`
- `resolved`
- `system`

The exact shape is framework-native:

- React returns plain values
- Solid returns accessors
- Vue returns refs and computed values
- Svelte returns stores

### `parseThemeCookie()`

Use `parseThemeCookie()` to read the saved theme from a raw `Cookie` header.

```ts
const initial = theme.parseThemeCookie(cookieHeader);
```

It reads the cookie configured by `createTheme()` and returns resolved theme state for the current request.

It returns `undefined` when the cookie is:

- missing
- empty
- malformed
- not in the allowed theme list

When present, the return value includes:

- `selected`
- `resolved`
- `system`

### `registerTheme()`

Use `registerTheme()` to pre-render the current theme on `<html>` during SSR.

```tsx
<html {...theme.registerTheme(initial)} />
```

It usually receives the result of `parseThemeCookie()` and returns one of three output shapes depending on `renderMode`:

- `jsx` (default) -> `{className, style, ...dataAttrs}`
- `html-attrs` -> `{class, style, ...dataAttrs}`
- `html-string` -> `class="..." style="..." data-theme="..."`

Examples:

```tsx
const jsxProps = theme.registerTheme(initial);

const htmlAttrs = theme.registerTheme(initial, {
  renderMode: 'html-attrs',
});

const htmlString = theme.registerTheme(initial, {
  renderMode: 'html-string',
});
```

Runtime overrides are:

- `forced`
- `renderMode`
- `className`
- `style`

Notes:

- it applies your configured `attribute` and `valueMap`
- it adds `color-scheme` automatically for resolved `'light'` and `'dark'` unless disabled
- in JSX mode, it may add `suppressHydrationWarning` when SSR cannot fully resolve the theme

### `themeScript()`

Use `themeScript()` to generate the inline bootstrap script that runs on the client before hydration.

```tsx
<script id="ssr-themes">{theme.themeScript()}</script>
<script id="ssr-themes">
  {theme.themeScript({forced: 'dark'})}
</script>
```

`themeScript()`:

- reads the saved theme from the cookie
- resolves `'system'` on the client when needed
- updates the `<html>` attributes
- sets `color-scheme` when appropriate

`themeScript()` only supports one runtime override:

- `forced`

Render it near the top of the document so the correct theme is applied before the app hydrates.

### Variants: `defaultVariant`, `encodeVariant()`, `decodeVariant()`, `listVariants()`

These helpers are for routing, caching, and pre-rendering.

```ts
const variant =
  theme.encodeVariant(
    theme.parseThemeCookie(cookieHeader),
  ) ?? theme.defaultVariant;

const initial = theme.decodeVariant(variant);
const variants = theme.listVariants();
```

- `defaultVariant` is the fallback serialized variant for the current config
- `encodeVariant()` returns a stable string when there is enough theme state to serialize
- `decodeVariant()` returns resolved theme state, or `undefined` for invalid values
- `listVariants()` returns the full set of valid pre-renderable theme variants

Encoded variants always include the system hint:

- explicit themes: `light~l`, `light~d`, `dark~l`, `dark~d`
- system mode: `~l`, `~d`

## Skills

The NPM package ships with [AI agent skills](https://github.com/0xcadams/ssr-themes/tree/main/ssr-themes/skills) to help migration from `next-themes` to `ssr-themes`.
