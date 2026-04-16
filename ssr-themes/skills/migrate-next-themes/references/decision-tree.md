# Decision Tree

Choose one migration mode before editing.

## Minimal

Recommended default.

Choose `minimal` when:

- the app mainly needs client-side theme switching
- the goal is a simple migration path from
  `next-themes`
- the UI should stop waiting for mount before showing
  the theme picker
- it is acceptable that raw server HTML does not know
  the selected theme yet

What it includes:

- `createTheme(...)`
- `themeScript()`
- bound `ThemeProvider`
- bound `useTheme()`
- removal of `mounted` guards that only existed for
  `next-themes`

What it does not include:

- `parseThemeCookie()`
- `registerTheme()`
- `initial`

## Maximal

Choose `maximal` when:

- SSR markup depends on the active theme for visitors
  who already have a saved theme cookie
- the server must render the current theme on `<html>`
  when that cookie is present
- theme-aware UI should already be correct in the
  server response for those returning visits

What it includes in addition to the minimal path:

- `parseThemeCookie()`
- `registerTheme()`
- `<ThemeProvider initial={initial}>`
- forced-theme wiring through SSR, bootstrap, and
  provider runtime props when needed

Tradeoff:

- Reading cookies in the App Router layout can make the
  route dynamic and is more invasive than the minimal
  path.
- If there is no theme cookie yet, SSR still cannot know
  the visitor's current client preference.

## Out of scope for this skill

Do not switch the app to the advanced cache-friendly
`proxy.ts` plus `[variant]` route pattern unless the
user explicitly asks for that architecture.
