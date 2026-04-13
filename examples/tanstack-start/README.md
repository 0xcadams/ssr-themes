# TanStack Start example

This example keeps theme-specific SSR off the public `/` entrypoint.

- `middleware.ts` reads the theme cookie on Vercel and redirects `/` to `/theme/[variant]`.
- `encodeVariant()` and `decodeVariant()` keep the route param in sync with the theme cookie format.
- `__root.tsx` renders the current theme from the variant path, so SSR no longer depends on reading cookies during render.
- `theme.$variant.tsx` validates the finite theme variants while reusing the same page UI.

Run it with `bun --cwd examples/tanstack-start dev`.
