# Next.js example

This example keeps the public `/` route cache-friendly in the App Router.

- `proxy.ts` reads the theme cookie once and rewrites `/` to a prebuilt `/theme/[variant]` route.
- `listVariants()` drives `generateStaticParams()`, so the static variants stay in sync with the same encoding used for cookies.
- `decodeVariant()` restores `selected`, `resolved`, and `system` inside the static layout, and `registerTheme()` pre-renders the correct `<html>` attributes.
- `ThemeProvider` reuses the decoded `initial` state directly, so the old switcher copy hydrates cleanly even when it reads the browser system text.
- First visits without a cookie default to the system theme and persist the resolved compact cookie value, so the example stays fully cacheable without reading cookies in layouts.
- Explicit themes store a color-scheme hint too, so cached variants look like `light~d`, `dark~l`, `~d`, and `~l`.

Run it with `bun --cwd examples/next dev`.
