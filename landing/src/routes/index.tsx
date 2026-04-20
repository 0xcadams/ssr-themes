import {createFileRoute} from '@tanstack/react-router';
import {useEffect, useState} from 'react';
import {useTheme} from '@/lib/theme';

import {CodeSnippetCard} from '@/components/home/code-snippet-card';
import {
  frameworkStorageKey,
  frameworks,
  liveDemoLinks,
  packageManagerStorageKey,
  packageManagers,
  type Framework,
  type PackageManager,
} from '@/components/home/home-config';
import {InstallCommandBar} from '@/components/home/install-command-bar';
import {SegmentedToggle} from '@/components/home/segmented-toggle';
import {ThemePickerCard} from '@/components/home/theme-picker-card';
import {Button} from '@/components/ui/button';
import {InlineCode} from '@/components/ui/inline-code';
import {getHighlightedFrameworkSnippets} from '@/lib/shiki';
import {ArrowUpRight} from 'lucide-react';

function IndexPage() {
  const {selected, setSelected, system} = useTheme();
  const [mounted, setMounted] = useState(false);
  const [framework, setFramework] =
    useState<Framework>('tanstack');
  const [packageManager, setPackageManager] =
    useState<PackageManager>('bun');
  const {frameworkSnippets} = Route.useLoaderData();

  useEffect(() => setMounted(true), []);
  useEffect(() => {
    if (!mounted) return;

    const storedManager = window.localStorage.getItem(
      packageManagerStorageKey,
    );
    const storedFramework =
      window.localStorage.getItem(frameworkStorageKey);

    if (
      storedManager &&
      packageManagers.some(
        manager => manager.value === storedManager,
      )
    ) {
      setPackageManager(
        storedManager as PackageManager,
      );
    }

    if (
      storedFramework &&
      frameworks.some(
        candidate =>
          candidate.value === storedFramework,
      )
    ) {
      setFramework(storedFramework as Framework);
    }
  }, [mounted]);

  useEffect(() => {
    if (!mounted) return;

    window.localStorage.setItem(
      packageManagerStorageKey,
      packageManager,
    );
  }, [packageManager, mounted]);

  useEffect(() => {
    if (!mounted) return;

    window.localStorage.setItem(
      frameworkStorageKey,
      framework,
    );
  }, [framework, mounted]);

  const activeTheme =
    mounted && selected ? selected : 'system';
  const systemNote = mounted
    ? system === 'dark'
      ? 'Auto dark'
      : 'Auto light'
    : 'Auto';
  const activePackageManager =
    packageManagers.find(
      manager => manager.value === packageManager,
    ) ?? packageManagers[0];
  const installCommand = activePackageManager.command;

  const activeFrameworkValue: Framework = mounted
    ? framework
    : 'tanstack';
  const activeFramework =
    frameworks.find(
      candidate =>
        candidate.value === activeFrameworkValue,
    ) ?? frameworks[0];
  const activeSnippet =
    frameworkSnippets[activeFrameworkValue] ??
    frameworkSnippets.tanstack;

  return (
    <div className="page-shell">
      <div
        className="page-backdrop"
        aria-hidden="true"
      />
      <div className="page-grid" aria-hidden="true" />
      <div className="relative mx-auto flex min-h-screen w-full max-w-6xl flex-col px-6 py-10 lg:py-16">
        <div className="absolute right-6 top-6 lg:right-8 lg:top-8">
          <Button
            asChild
            variant="outline"
            size="icon-sm"
            aria-label="GitHub"
          >
            <a href="https://github.com/0xcadams/ssr-themes">
              <svg
                className="size-5"
                viewBox="0 0 128 128"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M56.7937 84.9688C44.4187 83.4688 35.7 74.5625 35.7 63.0313C35.7 58.3438 37.3875 53.2813 40.2 49.9063C38.9812 46.8125 39.1687 40.25 40.575 37.5313C44.325 37.0625 49.3875 39.0313 52.3875 41.75C55.95 40.625 59.7 40.0625 64.2937 40.0625C68.8875 40.0625 72.6375 40.625 76.0125 41.6563C78.9187 39.0313 84.075 37.0625 87.825 37.5313C89.1375 40.0625 89.325 46.625 88.1062 49.8125C91.1062 53.375 92.7 58.1563 92.7 63.0313C92.7 74.5625 83.9812 83.2813 71.4187 84.875C74.6062 86.9375 76.7625 91.4375 76.7625 96.5938L76.7625 106.344C76.7625 109.156 79.1062 110.75 81.9187 109.625C98.8875 103.156 112.2 86.1875 112.2 65.1875C112.2 38.6563 90.6375 17 64.1062 17C37.575 17 16.2 38.6562 16.2 65.1875C16.2 86 29.4187 103.25 47.2312 109.719C49.7625 110.656 52.2 108.969 52.2 106.438L52.2 98.9375C50.8875 99.5 49.2 99.875 47.7 99.875C41.5125 99.875 37.8562 96.5 35.2312 90.2188C34.2 87.6875 33.075 86.1875 30.9187 85.9063C29.7937 85.8125 29.4187 85.3438 29.4187 84.7813C29.4187 83.6563 31.2937 82.8125 33.1687 82.8125C35.8875 82.8125 38.2312 84.5 40.6687 87.9688C42.5437 90.6875 44.5125 91.9063 46.8562 91.9063C49.2 91.9063 50.7 91.0625 52.8562 88.9063C54.45 87.3125 55.6687 85.9063 56.7937 84.9688Z"
                  fill="currentColor"
                />
              </svg>
            </a>
          </Button>
        </div>
        <main className="mt-16 flex-1">
          <div className="grid items-start gap-14 lg:grid-cols-[1.05fr_0.95fr] lg:gap-20">
            <section className="min-w-0 space-y-6 animate-rise animate-delay-2">
              <h1 className="font-display text-4xl leading-tight text-foreground sm:text-5xl">
                SSR-safe dark mode and theming
              </h1>
              <p className="max-w-xl text-lg text-muted-foreground">
                Theming for apps where the theme needs
                to affect server-rendered HTML, not
                just client state.
              </p>
              <div className="space-y-6">
                <div className="flex flex-col gap-3">
                  <SegmentedToggle
                    value={packageManager}
                    onValueChange={value => {
                      setPackageManager(value);
                    }}
                    options={packageManagers}
                  />
                  <InstallCommandBar
                    command={installCommand}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <span className="text-[0.7rem] text-muted-foreground/80">
                    Live demos
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {liveDemoLinks.map(link => (
                      <Button
                        key={link.href}
                        asChild
                        variant="outline"
                        size="sm"
                        className="bg-card/70 backdrop-blur"
                      >
                        <a
                          target="_blank"
                          href={link.href}
                        >
                          {link.label}

                          <ArrowUpRight className="size-3 opacity-50" />
                        </a>
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            <section className="min-w-0 animate-rise animate-delay-3">
              <ThemePickerCard
                activeTheme={activeTheme}
                systemNote={systemNote}
                onSelect={value => {
                  setSelected(value);
                }}
              />
            </section>
          </div>

          <div className="mt-14 grid max-w-2xl gap-6 text-left animate-rise animate-delay-4 lg:mt-16">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
              <SegmentedToggle
                value={framework}
                onValueChange={value => {
                  setFramework(value);
                }}
                options={frameworks}
                mobileLayout="grid"
              />
            </div>
            <CodeSnippetCard
              title="SSR setup"
              description={
                <>
                  Read the cookie on the server,
                  pre-render{' '}
                  <InlineCode>
                    registerTheme()
                  </InlineCode>{' '}
                  +{' '}
                  <InlineCode>
                    themeScript()
                  </InlineCode>
                  , then hydrate{' '}
                  <InlineCode>
                    ThemeProvider
                  </InlineCode>
                  .
                </>
              }
              html={activeSnippet.primaryHtml}
            />

            <CodeSnippetCard
              title={activeFramework.secondaryTitle}
              description={
                activeFramework.secondaryDescription
              }
              html={activeSnippet.secondaryHtml}
            />
          </div>
        </main>
      </div>
    </div>
  );
}

export const Route = createFileRoute('/')({
  loader: async () => ({
    frameworkSnippets:
      await getHighlightedFrameworkSnippets(),
  }),
  component: IndexPage,
});
