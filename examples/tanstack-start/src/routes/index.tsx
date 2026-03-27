import {
  Link,
  createFileRoute,
} from '@tanstack/react-router';
import type {ChangeEvent} from 'react';
import {useTheme} from 'ssr-themes';

function IndexPage() {
  const {theme, setTheme} = useTheme();
  const value = theme ?? 'system';

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

        <select
          id="theme-selector"
          className="rounded border border-current bg-transparent px-3 py-2 text-xl"
          value={value}
          onChange={(
            event: ChangeEvent<HTMLSelectElement>,
          ) =>
            setTheme(
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

        <p className="mx-auto max-w-lg text-sm leading-relaxed text-black/60 dark:text-white/60">
          Try{' '}
          <code className="rounded bg-black/5 px-1 py-0.5 dark:bg-white/10">
            light
          </code>{' '}
          on a dark system, then refresh. SSR preloads
          the select, so it shows{' '}
          <code className="rounded bg-black/5 px-1 py-0.5 dark:bg-white/10">
            light
          </code>{' '}
          right away, not system first.
        </p>

        <div className="text-lg">
          <Link
            className="underline underline-offset-4"
            to="/dark"
          >
            Forced Dark Page
          </Link>
          <span className="px-2 text-black/50 dark:text-white/50">
            •
          </span>
          <Link
            className="underline underline-offset-4"
            to="/light"
          >
            Forced Light Page
          </Link>
        </div>
      </div>
    </div>
  );
}

export const Route = createFileRoute('/')({
  component: IndexPage,
});
