# API Mapping

Use this file to translate `next-themes` concepts to
`ssr-themes`.

## Provider config

- `themes` -> `createTheme({themes})`
- `ThemeProvider attribute="class"` ->
  `createTheme({attribute: 'class'})`
- `ThemeProvider attribute="data-theme"` ->
  `createTheme({attribute: 'data-theme'})`
- `defaultTheme` -> `createTheme({defaultTheme})`
- `enableSystem` -> `createTheme({enableSystem})`
- `enableColorScheme` ->
  `createTheme({enableColorScheme})`
- `storageKey` -> `createTheme({cookie: {name}})`
- `value` -> `createTheme({valueMap})`

## Provider runtime props

- `forcedTheme` -> `forced`
- `disableTransitionOnChange` ->
  `disableTransition`
- `nonce` -> `nonce`
- `scriptProps` -> explicit props on the Next
  `<Script>` that renders `themeScript()`

Notes:

- `ssr-themes` uses a cookie instead of localStorage.
- `ThemeProvider` in `ssr-themes` disables transition
  flashes by default. If the old app explicitly used
  `disableTransitionOnChange`, you can usually omit the
  prop or pass `disableTransition` for clarity.
- If the old app intentionally kept transitions when
  switching themes, pass `disableTransition={false}`.
- If the old app used `scriptProps`, move those attrs to
  the explicit Next `<Script>` that renders
  `themeScript()`.
- If the old app used a CSP nonce for transition
  disabling styles, also pass `nonce` to
  `<ThemeProvider nonce={nonce}>`.
- If the old app forces a theme, pass the same value to
  every runtime touchpoint that affects first paint:
  - `<ThemeProvider forced={forced}>`
  - `themeScript({forced})`
  - `registerTheme(initial, {forced})` when SSR html
    props are used

## Hook mapping

Start with a shared theme object and bind it once:

```ts
import {bindTheme} from 'ssr-themes/react';

import {theme} from './theme';

const {useTheme} = bindTheme(theme);
```

Then map values like this:

- `theme` -> `selected`
- `setTheme(name)` -> `setSelected(name)`
- `resolvedTheme` -> `resolved`
- `systemTheme` -> `system`
- `forcedTheme` -> `forced`
- `themes` -> `themes`

## Common UI changes

For a select-based picker:

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

Use `themes` from the hook for option lists. It already
includes `system` when `enableSystem` is true.

Use `resolved` when the UI needs the literal active
theme applied to the document. Use `system` when the UI
needs the current browser preference.

## Mounted guard cleanup

When a component looks like this:

- `useState(false)` for `mounted`
- `useEffect(() => setMounted(true), [])`
- `if (!mounted) return ...`

and the only purpose is to avoid reading
`next-themes` state before mount, remove that guard
after converting the component to `ssr-themes`.
