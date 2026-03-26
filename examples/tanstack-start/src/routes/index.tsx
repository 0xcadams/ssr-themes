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
