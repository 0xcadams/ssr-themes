# ssr-themes ![ssr-themes minzip package size](https://img.shields.io/bundlephobia/minzip/ssr-themes) [![Version](https://img.shields.io/npm/v/ssr-themes.svg?colorB=green)](https://www.npmjs.com/package/ssr-themes)

Themes for your React SSR app.

- ✅ Perfect dark mode with no flashing
- ✅ System setting with `prefers-color-scheme`
- ✅ Themed browser UI with color-scheme
- ✅ SSR support for all frameworks (including TanStack Start/Next)
- ✅ Easy Tailwind integration
- ✅ Sync theme across tabs
- ✅ `useTheme` hook

Check out the live examples:

- Tanstack Start: [start.ssr-themes.cadams.io](https://start.ssr-themes.cadams.io)
- Next: [next.ssr-themes.cadams.io](https://next.ssr-themes.cadams.io)

## Install

```bash
npm install ssr-themes
# or
bun add ssr-themes
# or
pnpm install ssr-themes
# or
yarn add ssr-themes
```

## Use

### With TanStack Start

Add `ThemeProvider` to your root route and render `HeadContent`/`Scripts` in the document:

```tsx
// src/routes/__root.tsx
import {
  HeadContent,
  Outlet,
  Scripts,
  createRootRoute,
} from '@tanstack/react-router';
import type {ReactNode} from 'react';
import {ThemeProvider} from 'ssr-themes';
import appCss from '../styles.css?url';

function RootDocument({children}: {children: ReactNode}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body>
        <ThemeProvider attribute="class">{children}</ThemeProvider>
        <Scripts />
      </body>
    </html>
  );
}

export const Route = createRootRoute({
  head: () => ({
    links: [{rel: 'stylesheet', href: appCss}],
  }),
  component: function RootComponent() {
    return (
      <RootDocument>
        <Outlet />
      </RootDocument>
    );
  },
});
```

> **Note!** If you do not add [suppressHydrationWarning](https://reactjs.org/docs/dom-elements.html#suppresshydrationwarning:~:text=It%20only%20works%20one%20level%20deep) to your `<html>` you will get warnings because `ssr-themes` updates that element. This property only applies one level deep, so it won't block hydration warnings on other elements.

### SSR / RSC

`ssr-themes` uses cookies to set the theme, so the server can use `registerTheme` to read cookies and apply the right value directly to `<html>`. The inline script will reuse that value and skip cookie reads when the theme attribute/class is already present on the `<html>` element.

If you render theme-dependent UI before hydration, pass the same value to `ThemeProvider` as `initialTheme` so `useTheme()` reflects it on the server.

```tsx
import {registerTheme, ThemeProvider} from 'ssr-themes';
import {cookies} from 'next/headers';

const cookieStore = await cookies();
const theme = cookieStore.get('theme')?.value; // 'dark' | 'light' | undefined
const htmlProps = registerTheme({
  theme,
  attribute: 'class',
});

return (
  <html suppressHydrationWarning {...htmlProps}>
    <body>
      <ThemeProvider attribute="class" initialTheme={theme}>
        {children}
      </ThemeProvider>
    </body>
  </html>
);
```

### HTML & CSS

That's it, your app fully supports dark mode, including System preference with `prefers-color-scheme`. The theme is also immediately synced between tabs. By default, ssr-themes modifies the `class` attribute on the `html` element, so you can style your app like this:

```css
:root {
  /* Your default theme */
  --background: white;
  --foreground: black;
}

:root.dark {
  --background: black;
  --foreground: white;
}
```

> **Note!** If you want to use a data attribute instead of the default `class`, set `attribute` to a `data-*` value.

### useTheme

Your UI will need to know the current theme and be able to change it. The `useTheme` hook provides theme information:

```jsx
import {useTheme} from 'ssr-themes';

const ThemeChanger = () => {
  const {theme, setTheme} = useTheme();

  return (
    <div>
      The current theme is: {theme}
      <button onClick={() => setTheme('light')}>Light Mode</button>
      <button onClick={() => setTheme('dark')}>Dark Mode</button>
    </div>
  );
};
```

> The above code is hydration _unsafe_ and will throw a hydration mismatch warning when rendering with SSR. Use `registerTheme` on the server to have SSR populate the correct theme.
>
> You should delay rendering any theme toggling UI until mounted on the client. See the [example](#avoid-hydration-mismatch).

## API

Let's dig into the details.

### ThemeProvider

All your theme configuration is passed to ThemeProvider.

- `cookie = { name: 'theme', path: '/', maxAge: 31536000, sameSite: 'lax' }`: Cookie configuration for the theme cookie
- `initialTheme`: Theme name to use during server rendering when you already know the theme
- `defaultTheme = 'system'`: Default theme name. If `enableSystem` is false, the default theme is `light`
- `forcedTheme`: Forced theme name for the current page (does not modify saved theme settings)
- `enableSystem = true`: Whether to switch between `dark` and `light` based on `prefers-color-scheme`
- `enableColorScheme = true`: Whether to indicate to browsers which color scheme is used (dark or light) for built-in UI like inputs and buttons
- `disableTransitionOnChange = false`: Optionally disable all CSS transitions when switching themes ([example](#disable-transitions-on-theme-change))
- `themes = ['light', 'dark']`: List of theme names
- `attribute = 'class'`: HTML attribute modified based on the active theme
  - accepts `class` and `data-*` (meaning any data attribute, `data-mode`, `data-color`, etc.) ([example](#class-attribute-default))
- `value`: Optional mapping of theme name to attribute value
  - value is an `object` where key is the theme name and value is the attribute value ([example](#differing-dom-attribute-and-theme-name))
- `nonce`: Optional nonce passed to the injected `script` tag, used to allow-list the ssr-themes script in your CSP
- `scriptProps`: Optional props to pass to the injected `script` tag

### registerTheme

Use `registerTheme` to generate props for your `<html>` element on the server. When a theme is provided, it applies the theme attribute/class and sets `color-scheme` (if enabled), so the client script treats the existing HTML value as authoritative.

```tsx
const htmlProps = registerTheme({
  theme: 'dark',
  attribute: 'class',
});
```

If `theme` is `undefined` or `'system'`, it returns an empty object.

### useTheme

useTheme takes no parameters, but returns:

- `theme`: Active theme name
- `setTheme(name)`: Function to update the theme. The API is identical to the [set function](https://react.dev/reference/react/useState#setstate) returned by `useState`-hook. Pass the new theme value or use a callback to set the new theme based on the current theme.
- `forcedTheme`: Forced page theme or falsy. If `forcedTheme` is set, you should disable any theme switching UI
- `resolvedTheme`: If `enableSystem` is true and the active theme is "system", this returns whether the system preference resolved to "dark" or "light". Otherwise, identical to `theme`
- `systemTheme`: If `enableSystem` is true, represents the System theme preference ("dark" or "light"), regardless what the active theme is
- `themes`: The list of themes passed to `ThemeProvider` (with "system" appended, if `enableSystem` is true)

Not too bad, right? Let's see how to use these properties with examples:

## Examples

The [Live Example](https://ssr-themes-example.vercel.app/) shows ssr-themes in action, with dark, light, system themes and pages with forced themes.

### Use System preference by default

By default, `defaultTheme` is set to "system", so to use System preference you can simply use:

```jsx
<ThemeProvider>
```

### Ignore System preference

If you don't want a System theme, disable it via `enableSystem`:

```jsx
<ThemeProvider enableSystem={false}>
```

### Class attribute (default)

If your app uses a class to style the page based on the theme, you can be explicit about the default:

```jsx
<ThemeProvider attribute="class">
```

Now, setting the theme to "dark" will set `class="dark"` on the `html` element.

### Force page to a theme

Let's say your cool new marketing page is dark mode only. The page should always use the dark theme, and changing the theme should have no effect. In TanStack Start, add static data to the route and read it in the root route:

```tsx
// src/routes/dark.tsx
import {createFileRoute} from '@tanstack/react-router';

export const Route = createFileRoute('/dark')({
  staticData: {theme: 'dark'},
  component: DarkPage,
});
```

```tsx
// src/routes/__root.tsx
import { useMatches } from '@tanstack/react-router'

const matches = useMatches()
const forcedTheme = matches.reduce<string | undefined>((theme, match) => {
  const staticData = match.staticData as { theme?: string } | undefined
  return staticData?.theme ?? theme
}, undefined)

<ThemeProvider forcedTheme={forcedTheme} attribute="class">
  {children}
</ThemeProvider>
```

Done! Your page is always dark theme (regardless of user preference), and calling `setTheme` from `useTheme` is now a no-op. However, you should make sure to disable any of your UI that would normally change the theme:

```js
const {forcedTheme} = useTheme();

// Theme is forced, we shouldn't allow user to change the theme
const disabled = !!forcedTheme;
```

### Disable transitions on theme change

I wrote about [this technique here](https://paco.sh/blog/disable-theme-transitions). We can forcefully disable all CSS transitions before the theme is changed, and re-enable them immediately afterwards. This ensures your UI with different transition durations won't feel inconsistent when changing the theme.

To enable this behavior, pass the `disableTransitionOnChange` prop:

```jsx
<ThemeProvider disableTransitionOnChange>
```

### Differing DOM attribute and theme name

The name of the active theme is used as both the cookie value and the value of the DOM attribute. If the theme name is "pink", the cookie will contain `theme=pink` and the DOM will be `class="pink"`. You **cannot** modify the cookie value, but you **can** modify the DOM value.

If we want the DOM to instead render `class="my-pink-theme"` when the theme is "pink", pass the `value` prop:

```jsx
<ThemeProvider value={{ pink: 'my-pink-theme' }}>
```

Done! To be extra clear, this affects only the DOM. Here's how all the values will look:

```js
const {theme} = useTheme();
// => "pink"

document.cookie;
// => "theme=pink"

document.documentElement.className;
// => "my-pink-theme"
```

### More than light and dark mode

ssr-themes is designed to support any number of themes! Simply pass a list of themes:

```jsx
<ThemeProvider themes={['pink', 'red', 'blue']}>
```

> **Note!** When you pass `themes`, the default set of themes ("light" and "dark") are overridden. Make sure you include those if you still want your light and dark themes:

```jsx
<ThemeProvider themes={['pink', 'red', 'blue', 'light', 'dark']}>
```

For a starting point, check out `examples/next` or `examples/tanstack-start`.

### Without CSS variables

This library does not rely on your theme styling using CSS variables. You can hard-code the values in your CSS, and everything will work as expected (without any flashing):

```css
html,
body {
  color: #000;
  background: #fff;
}

html.dark,
html.dark body {
  color: #fff;
  background: #000;
}
```

### With TailwindCSS

The example in `examples/next` uses Tailwind v4 with a class-based dark mode.

Add the dark variant in your CSS:

```css
@import 'tailwindcss';
@custom-variant dark (&:where(.dark, .dark *));
```

Set the attribute for your Theme Provider to `class`:

```tsx
<ThemeProvider attribute="class">
```

When the theme is dark, ssr-themes applies the `dark` class to the `html` element:

```html
<html class="dark">
  <body>
    <div class="bg-white dark:bg-black">
      <!-- ... -->
    </div>
  </body>
</html>
```

That's it! Now you can use dark-mode specific classes:

```tsx
<h1 className="text-black dark:text-white">
```

### Avoid Hydration Mismatch

Because we cannot know the `theme` on the server, many of the values returned from `useTheme` will be `undefined` until mounted on the client. This means if you try to render UI based on the current theme before mounting on the client, you will see a hydration mismatch error.

The following code sample is **unsafe**:

```jsx
import {useTheme} from 'ssr-themes';

// Do NOT use this! It will throw a hydration mismatch error.
const ThemeSwitch = () => {
  const {theme, setTheme} = useTheme();

  return (
    <select value={theme} onChange={e => setTheme(e.target.value)}>
      <option value="system">System</option>
      <option value="dark">Dark</option>
      <option value="light">Light</option>
    </select>
  );
};

export default ThemeSwitch;
```

To fix this, make sure you only render UI that uses the current theme when the page is mounted on the client:

```jsx
import {useState, useEffect} from 'react';
import {useTheme} from 'ssr-themes';

const ThemeSwitch = () => {
  const [mounted, setMounted] = useState(false);
  const {theme, setTheme} = useTheme();

  // useEffect only runs on the client, so now we can safely show the UI
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <select value={theme} onChange={e => setTheme(e.target.value)}>
      <option value="system">System</option>
      <option value="dark">Dark</option>
      <option value="light">Light</option>
    </select>
  );
};

export default ThemeSwitch;
```

Alternatively, you could lazy load the component on the client side with `React.lazy`:

```jsx
import {Suspense, lazy} from 'react';

const ThemeSwitch = lazy(() => import('./ThemeSwitch'));

const ThemePage = () => {
  return (
    <Suspense fallback={null}>
      <ThemeSwitch />
    </Suspense>
  );
};

export default ThemePage;
```

To avoid [Layout Shift](https://web.dev/cls/), consider rendering a skeleton/placeholder until mounted on the client side.

#### Images

Showing different images based on the current theme also suffers from the hydration mismatch problem. You can use a placeholder image until the theme is resolved:

```jsx
import {useTheme} from 'ssr-themes';

function ThemedImage() {
  const {resolvedTheme} = useTheme();
  let src;

  switch (resolvedTheme) {
    case 'light':
      src = '/light.png';
      break;
    case 'dark':
      src = '/dark.png';
      break;
    default:
      src =
        'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
      break;
  }

  return <img src={src} width={400} height={400} alt="" />;
}

export default ThemedImage;
```

#### CSS

You can also use CSS to hide or show content based on the current theme. To avoid the hydration mismatch, you'll need to render _both_ versions of the UI, with CSS hiding the unused version. For example:

```jsx
function ThemedImage() {
  return (
    <>
      {/* When the theme is dark, hide this div */}
      <div data-hide-on-theme="dark">
        <img src="light.png" width={400} height={400} alt="" />
      </div>

      {/* When the theme is light, hide this div */}
      <div data-hide-on-theme="light">
        <img src="dark.png" width={400} height={400} alt="" />
      </div>
    </>
  );
}

export default ThemedImage;
```

```css
:root.dark [data-hide-on-theme='dark'],
:root.light [data-hide-on-theme='light'] {
  display: none;
}
```

## Discussion

### The Flash

ThemeProvider automatically injects a script to update the `html` element with the correct attributes before the rest of your page loads. This means the page will not flash under any circumstances, including forced themes, system theme, multiple themes, and incognito. No `noflash.js` required.

## FAQ

---

**Why is my page still flashing?**

In dev mode, the page may still flash. When you build your app in production mode, there will be no flashing.

---

**Why do I get server/client mismatch error?**

When using `useTheme`, you will use see a hydration mismatch error when rendering UI that relies on the current theme. This is because many of the values returned by `useTheme` are undefined on the server, since we can't read cookies until mounting on the client. See the [example](#avoid-hydration-mismatch) for how to fix this error.

---

**Do I need to use CSS variables with this library?**

Nope. See the [example](#without-css-variables).

---

**Can I set the class or data attribute on the body or another element?**

Nope. If you have a good reason for supporting this feature, please open an issue.

---

**Is the injected script minified?**

Yes.

---

**Why is `resolvedTheme` necessary?**

When supporting the System theme preference, you want to make sure that's reflected in your UI. This means your buttons, selects, dropdowns, or whatever you use to indicate the current theme should say "System" when the System theme preference is active.

If we didn't distinguish between `theme` and `resolvedTheme`, the UI would show "Dark" or "Light", when it should really be "System".

`resolvedTheme` is then useful for modifying behavior or styles at runtime:

```jsx
const { resolvedTheme } = useTheme()

<div style={{ color: resolvedTheme === 'dark' ? 'white' : 'black' }}>
```

If we didn't have `resolvedTheme` and only used `theme`, you'd lose information about the state of your UI (you would only know the theme is "system", and not what it resolved to).
