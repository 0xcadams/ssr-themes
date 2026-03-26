import Link from 'next/link';

import ThemeSwitcher from '../theme-switcher';

export default function Page() {
  return (
    <main className="flex min-h-screen w-full items-center justify-center px-6">
      <div className="space-y-6 text-center">
        <h1 className="text-4xl font-semibold">
          ssr-themes next.js example
        </h1>
        <ThemeSwitcher />
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
            href="/dark"
          >
            Forced Dark Page
          </Link>
          <span className="px-2 text-black/50 dark:text-white/50">
            •
          </span>
          <Link
            className="underline underline-offset-4"
            href="/light"
          >
            Forced Light Page
          </Link>
        </div>
      </div>
    </main>
  );
}
