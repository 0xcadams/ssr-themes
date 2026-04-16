# Verification

Use the project's existing package manager and scripts.
Do not invent a new toolchain if the repo already has
working commands.

## Static checks

Run the most relevant existing checks for the app you
changed:

- install dependencies if the lockfile changed
- typecheck, if the project exposes one
- build the Next.js app

Examples only when no better project-specific script is
available:

```bash
next build
```

## Code checks

Confirm these are true:

- no remaining `next-themes` imports in migrated files
- the old provider wrapper was removed or rewritten
- theme config now comes from `app/theme.ts`
- existing `themes`, `enableColorScheme`, and any other
  non-default provider behavior were preserved
- existing `forcedTheme`, `nonce`, and `scriptProps`
  wiring was preserved where present
- any `mounted` guard that existed only for
  `next-themes` was removed

## Manual browser checks

Confirm:

- switching every configured theme, plus `system` when
  enabled, still works
- refreshing preserves the chosen theme
- the expected `<html>` class or data attribute updates
- `color-scheme` updates correctly when it is enabled
- forced-theme routes stay forced during SSR,
  bootstrap, and hydration, if applicable
- there is no mount-only placeholder for the picker

Extra expectation by mode:

- `minimal`: the bootstrap script applies theme early,
  but raw server HTML does not pre-render theme state
- `maximal`: when a valid theme cookie exists, SSR
  markup and hydrated UI agree on the active theme from
  the first render; first-time visits without a cookie
  still rely on the bootstrap script

## Report back

Tell the user:

- which mode was used
- which verification steps were run
- whether anything could not be verified locally
