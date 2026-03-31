'use client';

import {useEffect, useState} from 'react';
import {useTheme} from 'ssr-themes/react';

export default function ThemeSwitcher() {
  const {theme, setTheme, forcedTheme, colorScheme} =
    useTheme();

  const disabled = Boolean(forcedTheme);
  const value = theme ?? 'system';
  const [mounted, setMounted] = useState(false);
  const clientColorScheme = mounted
    ? colorScheme
    : undefined;
  const suggestedTheme =
    clientColorScheme === 'dark'
      ? 'light'
      : clientColorScheme === 'light'
        ? 'dark'
        : undefined;
  const flashedTheme =
    suggestedTheme === 'dark'
      ? 'light'
      : suggestedTheme === 'light'
        ? 'dark'
        : undefined;
  const codeClassName =
    'rounded bg-black/5 px-1 py-0.5 dark:bg-white/10';

  useEffect(() => {
    setMounted(true);
  }, []);

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
        {suggestedTheme && flashedTheme ? (
          <>
            Try{' '}
            <code className={codeClassName}>
              {suggestedTheme}
            </code>
            , refresh the page, and watch whether the
            select briefly flashes{' '}
            <code className={codeClassName}>
              {flashedTheme}
            </code>{' '}
            before settling on{' '}
            <code className={codeClassName}>
              {suggestedTheme}
            </code>
            .
          </>
        ) : (
          <>
            Try the theme opposite your device setting,
            refresh the page, and watch whether the
            select briefly flashes the wrong value
            before settling on your choice.
          </>
        )}
      </p>
    </>
  );
}
