import Link from 'next/link';

import ThemeSwitcher from '../theme-switcher';

export default function Page() {
  return (
    <main className="flex min-h-screen w-full items-center justify-center px-6">
      <div className="space-y-6 text-center">
        <h1 className="text-4xl font-semibold">ssr-themes next.js example</h1>
        <ThemeSwitcher />
        <div className="text-lg">
          <Link className="underline underline-offset-4" href="/dark">
            Forced Dark Page
          </Link>
          <span className="px-2 text-black/50 dark:text-white/50">•</span>
          <Link className="underline underline-offset-4" href="/light">
            Forced Light Page
          </Link>
        </div>
      </div>
    </main>
  );
}
