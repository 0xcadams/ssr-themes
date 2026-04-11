# ssr-themes [![Version](https://img.shields.io/npm/v/ssr-themes.svg?colorB=green)](https://www.npmjs.com/package/ssr-themes)

Theming is hard with SSR.

The server is usually unaware of client theme preference. This skew between what the server defaults to and what is hydrated on the client will commonly result in a flash of the wrong content.

`ssr-themes` keeps the server HTML, bootstrap script, and hydrated app in sync. It uses cookies to store the correct theme (and if it's set to `system`, will auto-send that preference) and has first-party bindings for React, Svelte, Vue, and more. This means:

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

1. `createTheme(...)` captures the shared theme config once.
2. The returned SSR helpers (`parseThemeCookie()`, `registerTheme()`, and `themeScript()`) keep the server HTML and bootstrap script aligned.
3. `bindTheme(...)` returns a framework-specific `ThemeProvider` and `useTheme()` that use that same config on the client.

```tsx
import {createTheme} from 'ssr-themes';
import {bindTheme} from 'ssr-themes/react';

const {
  options,
  registerTheme,
  parseThemeCookie,
  themeScript,
} = createTheme({
  themes: ['light', 'dark'],
  attribute: 'class',
});

const {ThemeProvider} = bindTheme(options);

const initial = parseThemeCookie(cookieHeader);

// `suppressHydrationWarning` tells React to ignore differences
// between client and server. This diff happens when the theme is
// `system` and the server doesn't know what that will resolve
// to on the client
<html
  suppressHydrationWarning
  {...registerTheme(initial)}
>
  <head>
    <script id="ssr-themes">{themeScript()}</script>
  </head>
  <body>
    <ThemeProvider initial={initial}>
      {children}
    </ThemeProvider>
  </body>
</html>;
```

## Why not `next-themes`?

`next-themes` is popular because it makes client-side theming in React and Next.js easy.

But it solves a subset of the theming problem.

Its docs explicitly warn that reading `theme` before mount is hydration-unsafe, because the server does not know the current theme yet. That is a reasonable tradeoff if all you need is client-resolved theme state.

`ssr-themes` is for apps that want the theme to participate in SSR. You can:

- Read the theme from the request cookie during SSR
- Pre-render the correct `<html>` attributes on the server (and render `<select>`, etc. correctly)

You don't even _need_ to use the SSR helpers. They are optional if/when you need to start rendering conditional UI based on the theme. You'll probably do this with a theme picker.

If you only need client-side theme state in a Next.js app, `next-themes` is a good fit.

If your SSR markup depends on the theme or you don't use Next.js, `ssr-themes` is a good fit.

If you want a cache-friendly App Router setup, see the [Next.js example](https://github.com/0xcadams/ssr-themes/tree/main/examples/next). It uses `proxy.ts` plus `listVariants()` so the public `/` route stays cacheable and layouts do not read cookies.

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

### `createTheme()`

Use `createTheme()` once to capture the shared theme config.

```ts
import {createTheme} from 'ssr-themes';

const {
  decodeVariant,
  encodeVariant,
  options,
  listVariants,
  registerTheme,
  parseThemeCookie,
  themeScript,
} = createTheme({
  themes: ['light', 'dark', 'quartz'],
  attribute: 'class',
  defaultTheme: 'system',
});
```

`options` is the exact typed config object passed into `createTheme()`. Inline theme arrays are inferred as tuples, so `themes: ['light', 'dark', 'quartz']` automatically becomes `'light' | 'dark' | 'quartz'` in the returned helpers and bound hooks.

Stable config belongs here:

- `themes`
- `defaultTheme`
- `enableSystem`
- `enableColorScheme`
- `attribute`
- `valueMap`
- `cookie`

### `bindTheme()`

Use `bindTheme()` in the framework entrypoint for your app.

```ts
import {bindTheme} from 'ssr-themes/react';

const {ThemeProvider, useTheme} = bindTheme(theme);
// or: bindTheme(options)
```

`bindTheme()` accepts either the full `createTheme()` return value or `theme.options`, and returns:

- `ThemeProvider`
- `useTheme()`

All bindings expose the same core theme state:

- `selected`
- `setSelected(next)`
- `forced`
- `resolved`
- `system`
- `themes`

`ThemeProvider` only takes runtime props:

- `initial`
- `forced`
- `disableTransition`
- `nonce`

### `parseThemeCookie()`

Use `parseThemeCookie()` during SSR to read the saved theme from a raw `Cookie` header.

```ts
const initial = parseThemeCookie(cookieHeader);
```

It returns `undefined` when the cookie is missing, empty, malformed, or not in the allowed theme list.

When present, the return value has:

- `selected`
- `resolved`
- `system`

The cookie stores system mode in a compact form like `~d` or `~l`, and stores explicit themes with the same system hint suffix, such as `dark~l` or `quartz~d`.

### `encodeVariant()`, `decodeVariant()`, and `listVariants()`

Use these helpers when you want a stable theme key for routing or caching, such as a Next.js `proxy.ts` rewrite.

```ts
const variant =
  encodeVariant(parseThemeCookie(cookieHeader)) ??
  'light~l';

const initial = decodeVariant(variant);
const variants = listVariants();
```

- Explicit themes always include the system hint, like `light~d` and `dark~l`
- System mode serializes to the compact values `~l` and `~d`
- `listVariants()` returns the finite set of pre-renderable theme variants for `generateStaticParams()`

### `registerTheme()`

Use `registerTheme()` to pre-render the current theme on `<html>` during SSR.

```tsx
const htmlProps = registerTheme({
  selected: 'dark',
  resolved: 'dark',
});

const astroHtmlProps = registerTheme(
  {
    selected: 'dark',
    resolved: 'dark',
  },
  {
    renderMode: 'html-attrs',
  },
);

const htmlAttributes = registerTheme(
  {
    selected: 'dark',
    resolved: 'dark',
  },
  {
    renderMode: 'html-string',
  },
);
```

The first argument is theme state, usually the result of `parseThemeCookie()`.

- Default `jsx` mode returns `{className, style, ...dataAttrs}` for JSX hosts like React.
- `html-attrs` returns `{class, style, ...dataAttrs}` for hosts like Astro or `useHead()`.
- `html-string` returns `class="..." style="..." data-theme="..."` for string transforms like Svelte `app.html`.

The second argument is for runtime overrides only:

- `forced`
- `renderMode`
- `className`
- `style`

### `themeScript()`

Use `themeScript()` to generate the inline bootstrap script that runs on the client before hydration.

```tsx
<script id="ssr-themes">{themeScript()}</script>
<script id="ssr-themes">{themeScript({forced})}</script>
```

It reads the saved theme from the cookie, resolves `'system'` when needed, updates the `<html>` attributes, and sets `color-scheme` when appropriate.

`themeScript()` only supports one runtime override:

- `forced`
