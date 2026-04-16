'use client';

import {bindTheme} from 'ssr-themes/react';

import {theme} from './theme';

const {useTheme} = bindTheme(theme);

const codeClassName =
  'rounded bg-black/5 px-1 py-0.5 dark:bg-white/10';

export default function ThemeSwitcher() {
  const {selected, setSelected, forced, system} =
    useTheme();

  const disabled = Boolean(forced);
  const value = selected ?? 'system';
  const deviceTheme = system ?? 'dark';
  const suggestedTheme =
    deviceTheme === 'dark' ? 'light' : 'dark';

  return (
    <>
      <select
        id="theme-selector"
        className="rounded border border-current bg-transparent px-3 py-2 text-2xl"
        value={value}
        onChange={event =>
          setSelected(
            event.target.value as NonNullable<
              typeof selected
            >,
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
        Try{' '}
        <code className={codeClassName}>
          {suggestedTheme}
        </code>
        , refresh the page, and check that the select
        never briefly shows{' '}
        <code className={codeClassName}>
          {deviceTheme}
        </code>{' '}
        first.
      </p>
    </>
  );
}
