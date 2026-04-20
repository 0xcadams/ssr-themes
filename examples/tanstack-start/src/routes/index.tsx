import {createFileRoute} from '@tanstack/react-router';
import {type ChangeEvent} from 'react';
import {encodeVariant, useTheme} from '../lib/theme';

function IndexPage() {
  const {selected, setSelected, system} = useTheme();
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
  const codeClassName =
    'rounded bg-black/5 px-1 py-0.5 dark:bg-white/10';
  const selectClassName =
    'appearance-none rounded border border-current bg-transparent px-3 py-2 pr-10 text-xl';

  return (
    <div className="flex min-h-screen w-full items-center justify-center px-6">
      <a href="https://ssr-themes.cadams.io/">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="absolute left-6 top-6"
        >
          <path d="m12 19-7-7 7-7" />
          <path d="M19 12H5" />
        </svg>
      </a>

      <div className="space-y-6 text-center">
        <h1 className="text-4xl font-semibold">
          ssr-themes tanstack start example
        </h1>

        <div className="relative mx-auto w-fit">
          <select
            id="theme-selector"
            className={selectClassName}
            value={value}
            onChange={(
              event: ChangeEvent<HTMLSelectElement>,
            ) =>
              setSelected(
                event.target.value as
                  | 'light'
                  | 'dark'
                  | 'system',
              )
            }
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
      </div>
    </div>
  );
}

export const Route = createFileRoute('/')({
  component: IndexPage,
});
