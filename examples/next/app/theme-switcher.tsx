'use client';

import {bindTheme} from 'ssr-themes/react';

import {encodeVariant, theme} from './theme';

const {useTheme} = bindTheme(theme);

const codeClassName =
  'rounded bg-black/5 px-1 py-0.5 dark:bg-white/10';
const selectClassName =
  'appearance-none rounded border border-current bg-transparent px-3 py-2 pr-10 text-2xl disabled:cursor-not-allowed disabled:opacity-60';

export default function ThemeSwitcher() {
  const {selected, setSelected, forced, system} =
    useTheme();

  const disabled = Boolean(forced);
  const value = selected ?? 'system';
  const deviceTheme = system ?? 'dark';
  const suggestedTheme =
    deviceTheme === 'dark' ? 'light' : 'dark';
  const cookieValue =
    encodeVariant({
      selected: value,
      resolved:
        value === 'system' ? deviceTheme : value,
      system: deviceTheme,
    }) ?? (deviceTheme === 'dark' ? '~d' : '~l');

  return (
    <>
      <div className="relative mx-auto w-fit">
        <select
          id="theme-selector"
          className={selectClassName}
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

        <span
          className="pointer-events-none absolute inset-y-0 right-3 flex items-center opacity-70"
          aria-hidden="true"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 12 12"
            fill="none"
          >
            <path
              d="m2.5 4.5 3.5 3.5 3.5-3.5"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      </div>

      <p className="mx-auto max-w-lg text-sm leading-relaxed text-black/60 dark:text-white/60">
        The theme cookie is set to{' '}
        <code
          className={codeClassName}
          data-test-id="theme-cookie-value"
        >
          {cookieValue}
        </code>
        . Try{' '}
        <code
          className={codeClassName}
          data-test-id="theme-suggested-theme"
        >
          {suggestedTheme}
        </code>
        , refresh the page, and check that the select
        doesn't flash your system's{' '}
        <code
          className={codeClassName}
          data-test-id="theme-system-setting"
        >
          {deviceTheme}
        </code>{' '}
        setting first.
      </p>
    </>
  );
}
