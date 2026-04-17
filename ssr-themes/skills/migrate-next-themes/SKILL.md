---
name: migrate-next-themes
description: Migrate a Next.js App Router project from next-themes to ssr-themes. Use when replacing next-themes providers and hooks, removing mounted theme guards, and choosing between a minimal client-bootstrap migration and a maximal SSR-aware migration.
argument-hint: '[minimal|maximal]'
disable-model-invocation: true
---

# Migrate `next-themes` to `ssr-themes`

Migrate the current project from `next-themes` to
`ssr-themes` in place.

## Scope

- Support Next.js App Router projects only.
- Do not attempt Pages Router migrations.
- Preserve the project name, package name, app copy,
  styling, and theme names unless a file specifically
  mentions `next-themes` and needs wording updates.
- Prefer the smallest correct set of edits.

## Arguments

- `$0` is the requested migration mode.
- Valid modes are `minimal` and `maximal`.

If `$0` is missing or invalid, ask exactly one focused
question before editing:

"Do you want the minimal or maximal migration?
Recommended: minimal. Minimal keeps the migration
simple with `themeScript()` and `ThemeProvider` only.
Maximal also reads the cookie on the server and uses
`registerTheme()` plus `initial` so theme-aware SSR
markup is correct on first render."

Do not make edits until the user answers that question.

## Preflight

Before editing:

1. Confirm the repo uses Next.js App Router by finding
   an `app/` directory and the current layout/provider
   wiring.
2. Find all `next-themes` imports and all `useTheme()`
   call sites.
3. Identify any mounted guards that exist only because
   `next-themes` theme state is hydration-unsafe.
4. Inspect the current provider config and preserve its
   theme behavior where possible:
   - `themes`
   - `attribute`
   - `defaultTheme`
   - `enableSystem`
   - `enableColorScheme`
   - custom theme names
   - theme value mapping
   - `nonce` and `scriptProps`
   - forced-theme behavior

If the project is Pages Router only, stop and explain
that this skill supports App Router only.

## Core migration rules

- Remove `next-themes` from dependencies and add
  `ssr-themes`.
- Create a shared `app/theme.ts` file when the app does
  not already have one.
- Use `createTheme(...)` for shared config.
- Use `bindTheme(theme)` from `ssr-themes/react`.
- Keep `suppressHydrationWarning` on `<html>` when the migration
  is not maximal, because the SSR markup will not be theme-aware
  until the client script runs.
- Preserve existing bootstrap script attributes such as
  `nonce` and `data-*` when replacing the old
  provider-managed script with an explicit Next
  `<Script>`.
- If the old app uses a forced theme, carry the same
  `forced` value through every runtime touchpoint that
  affects first paint:
  - `<ThemeProvider forced={...}>`
  - `themeScript({forced: ...})`
  - `registerTheme(initial, {forced: ...})` when using
    maximal mode
- Remove temporary mounted placeholders only when they
  were added solely to avoid `next-themes` hydration
  mismatches.
- Use the project's existing package manager and script
  conventions.
- Do not introduce the advanced cache-friendly
  `proxy.ts` plus route-variant pattern unless the user
  explicitly asks for it.

## Decision flow

Read these references before editing:

- [references/decision-tree.md](references/decision-tree.md)
- [references/api-mapping.md](references/api-mapping.md)

Then load exactly one implementation guide based on the
chosen mode:

- `minimal`:
  [references/app-router-minimal.md](references/app-router-minimal.md)
- `maximal`:
  [references/app-router-maximal.md](references/app-router-maximal.md)

After editing, run the checks in
[references/verification.md](references/verification.md).

## What to migrate

Apply the conversion in this order:

1. Dependency replacement.
2. Shared theme config.
3. Layout/provider wiring.
4. Client hook usage.
5. Mounted-guard cleanup.
6. Copy updates that still mention `next-themes`.
7. Verification.

## Behavior expectations

For `minimal` migrations:

- Use `themeScript()` and `ThemeProvider` only.
- Do not read cookies on the server.
- Do not call `registerTheme()`.
- Do not pass `initial` to `ThemeProvider`.
- If the route forces a theme, still pass `forced` to
  both `themeScript(...)` and `ThemeProvider`.

For `maximal` migrations:

- Read the cookie on the server with
  `parseThemeCookie()`.
- Apply SSR html props with `registerTheme(...)`.
- Pass the parsed state to
  `<ThemeProvider initial={...}>`.
- If the route forces a theme, also pass `forced` to
  `registerTheme(...)`, `themeScript(...)`, and
  `ThemeProvider`.
- Maximal mode keeps SSR and hydration aligned when a
  valid theme cookie exists. First-time visits without a
  theme cookie still rely on `themeScript()` for early
  client application.

## Finish

When done:

- Summarize which mode was used.
- List the main files changed.
- Mention any remaining manual follow-up, if any.
