'use client';

import {useTheme} from './theme-react';

export default function ThemeSwitcher() {
  const {theme, setTheme, forcedTheme} = useTheme();

  const disabled = Boolean(forcedTheme);
  const value = theme ?? 'light';

  return (
    <>
      <select
        id="theme-selector"
        className="rounded border border-current bg-transparent px-3 py-2 text-2xl"
        value={value}
        onChange={event =>
          setTheme(
            event.target.value as
              | 'light'
              | 'dark'
              | 'system',
          )
        }
        disabled={disabled}
        aria-label="Theme"
        data-test-id="theme-selector"
      >
        <option value="system">System</option>
        <option value="dark">Dark</option>
        <option value="light">Light</option>
      </select>

      <p className="mx-auto max-w-lg text-sm leading-relaxed text-black/60 dark:text-white/60">
        This example keeps `/` cache-friendly by
        rewriting to static theme variants in
        `proxy.ts`.
      </p>
    </>
  );
}
