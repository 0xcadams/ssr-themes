import ThemeSwitcher from '../../theme-switcher';

export default function Page() {
  return (
    <main className="flex min-h-screen w-full items-center justify-center px-6">
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
          ssr-themes next.js example
        </h1>
        <ThemeSwitcher />
      </div>
    </main>
  );
}
