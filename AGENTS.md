# AGENTS.md

## Scope

- Bun workspace for the `ssr-themes` library, the `landing/` app, and the `examples/` apps.
- Package manager is `bun@1.3.6`; runtime baseline is Node `>=20`.
- CI runs from the repo root and covers unit tests plus Playwright.

## Repo Map

- `ssr-themes/` - published library source, `tsup` build, Vitest tests.
- `landing/` - TanStack Start marketing/docs site.
- `examples/next/` - Next.js App Router example used by Playwright.
- `examples/tanstack-start/` - TanStack Start example.
- `test/` - root Playwright specs.

## Repo-Specific Rules

- No existing root `AGENTS.md` was present when this file was created.
- No `.cursorrules`, no `.cursor/rules/`, and no `.github/copilot-instructions.md` were found.
- There are no extra Cursor or Copilot instruction files to merge beyond this document.

## Tooling Notes

- Run commands from the repo root unless a package-local run is clearer.
- Root scripts use Bun workspace filters; there is no Turbo/Nx layer.
- There is no ESLint, Biome, or Rome config today.
- Formatting is controlled by `.prettierrc`; standalone typecheck uses `tsc --noEmit`.

## Commands

Verified from the repo root:

```bash
# install / clean
bun install
bun run clean
# dev
bun run dev
bun --filter ssr-themes dev
bun --filter @ssr-themes/next dev
bun --filter @ssr-themes/tanstack-start dev
bun --filter @ssr-themes/landing dev
# build
bun run build
bun --filter ssr-themes build
bun --filter @ssr-themes/next build
bun --filter @ssr-themes/tanstack-start build
bun --filter @ssr-themes/landing build
# format / lint-equivalent / typecheck
bun run format
bunx prettier . --check
bunx prettier . --write
bunx tsc --noEmit -p ssr-themes/tsconfig.json
bunx tsc --noEmit -p landing/tsconfig.json
bunx tsc --noEmit -p examples/next/tsconfig.json
bunx tsc --noEmit -p examples/tanstack-start/tsconfig.json
# tests
bun run test
bun --filter ssr-themes test
bun run test:e2e
# single unit test
bunx vitest run ssr-themes/tests/header.test.ts
bunx vitest run ssr-themes/tests/index.test.tsx -t "setTheme"
# single Playwright test
bunx playwright test test/system-theme.test.ts
bunx playwright test test/system-theme.test.ts -g "should render dark theme if preferred-colorscheme is dark"
bunx playwright test --list test/system-theme.test.ts
```

- `bun run format` is the only scripted formatter command.
- Treat `bunx prettier . --check` as the repo's lint-equivalent check.
- `bun run test` mainly runs the library's Vitest suite.
- `bun run test:e2e` first builds `ssr-themes`, then runs Playwright.
- Playwright boots `@ssr-themes/next` on port `4041`.
- Use Vitest `-t` and Playwright `-g` to target a single test; use Playwright `--list` to inspect titles.

## Code Style

### Formatting

- Follow `.prettierrc`: single quotes, trailing commas, no bracket spacing, `arrowParens: avoid`, `quoteProps: consistent`.
- Prettier print width is `55`; aggressive wrapping is expected.
- Keep semicolons and let Prettier own line breaks.

### Imports

- Keep imports at the top of the file.
- Put external packages before internal alias or relative imports.
- Use `import type` or inline `type` specifiers for type-only imports.
- Use `import * as React from 'react'` when the file uses the `React.` namespace; otherwise named imports are fine.
- CSS side-effect imports usually come after value imports.
- Match the surrounding file's grouping style instead of imposing a new one.

### TypeScript

- Prefer explicit props and return types when they improve readability or public API safety.
- Avoid `any`; use generics, unions, `unknown`, `Partial<Record<...>>`, template literal types, `as const`, and `satisfies`.
- Preserve strong public typing in `ssr-themes/` exports.
- The library is not fully `strict`, but it still relies on `strictNullChecks`, `exactOptionalPropertyTypes`, `noUncheckedIndexedAccess`, `noUnusedLocals`, `noUnusedParameters`, and `noImplicitReturns`.
- The landing app and examples are `strict: true`; do not weaken types there.

### Naming

- Components, exported types, and interfaces use `PascalCase`.
- Hooks and helpers use `camelCase`.
- Route modules export `Route` from `createFileRoute(...)` or `createRootRoute(...)`.
- Library filenames use kebab-case like `theme-script.ts` and `register-theme.ts`.
- Reserve `SCREAMING_SNAKE_CASE` for true shared constants; many normal constants stay `camelCase`.

### React / SSR / Theme Conventions

- Keep `'use client';` only in files that truly need client execution.
- For Next.js Server Components, import the provider from `ssr-themes/react` and shared SSR helpers from `ssr-themes`.
- When theme logic mutates `<html>`, keep `suppressHydrationWarning` on `<html>`.
- If you customize `themes`, `attribute`, `valueMap`, or `cookie`, pass the same options to both `themeScript()` and `ThemeProvider`.
- If SSR output depends on the current theme, read cookies on the server and pass the value through `registerTheme(...)` and `initialTheme`.
- Keep theme changes hydration-safe and cookie-backed.

### Errors And Control Flow

- Prefer early returns and guard clauses.
- For malformed cookie values or missing browser state, return `undefined` or no-op instead of throwing.
- Use `try` / `catch` sparingly around browser APIs that may fail or be unavailable.
- Swallow errors only when failure is expected and harmless, such as clipboard or cookie persistence fallbacks.
- Use `catch {}` when the error object is intentionally unused.

### Tests

- Unit tests use Vitest; React tests use Testing Library and jsdom.
- E2E tests use Playwright from the repo root.
- Test files use `*.test.ts` or `*.test.tsx`.
- Reuse helpers when building matrix-style coverage.
- Prefer `describe`, `test`, `it`, `renderHook`, `act`, and `screen` in the existing style.
- Keep `data-test-id` selectors stable when Playwright depends on them.
- If you change theme behavior, run both Vitest and Playwright.

### Styling

- Landing and example apps use Tailwind CSS v4 via `@import 'tailwindcss';`.
- Theme variants are driven by HTML classes and custom variants like `@custom-variant dark`.
- Shared UI components in `landing/` use `cva` plus the local `cn(...)` helper.
- Prefer CSS variables for theme tokens over duplicated literal colors.
- Preserve the current visual language instead of redesigning unrelated UI.

### Generated Files

- Do not hand-edit `landing/src/routeTree.gen.ts` or `examples/tanstack-start/src/routeTree.gen.ts`.
- Those files are generated by TanStack Router and marked as overwrite-only.
- Keep generated files out of manual lint/format churn when possible.

## Change Checklist

- Update docs or examples when public library API changes.
- Keep `README.md` and landing snippets aligned with behavior changes.
- If you touch SSR or hydration behavior, verify the Next example path used by Playwright.
- Prefer minimal, targeted edits that match existing patterns.
