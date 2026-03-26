import {createFileRoute} from '@tanstack/react-router';
import {ArrowUpRight} from 'lucide-react';
import {useTheme} from 'ssr-themes';
import {useEffect, useState} from 'react';

import {CodeSnippetCard} from '@/components/home/code-snippet-card';
import {
  frameworkStorageKey,
  frameworks,
  liveDemoLinks,
  packageManagerStorageKey,
  packageManagers,
  type Framework,
  type PackageManager,
  type ThemeValue,
} from '@/components/home/home-config';
import {InstallCommandBar} from '@/components/home/install-command-bar';
import {SegmentedToggle} from '@/components/home/segmented-toggle';
import {ThemePickerCard} from '@/components/home/theme-picker-card';
import {Button} from '@/components/ui/button';
import {InlineCode} from '@/components/ui/inline-code';
import {getHighlightedFrameworkSnippets} from '@/lib/shiki';

function IndexPage() {
  const {theme, setTheme, systemTheme} =
    useTheme<ThemeValue>();
  const [mounted, setMounted] = useState(false);
  const [framework, setFramework] =
    useState<Framework>('next');
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
    mounted && theme ? theme : 'system';
  const systemNote = mounted
    ? systemTheme === 'dark'
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
    : 'next';
  const activeFramework =
    frameworks.find(
      candidate =>
        candidate.value === activeFrameworkValue,
    ) ?? frameworks[0];
  const activeSnippet =
    frameworkSnippets[activeFrameworkValue] ??
    frameworkSnippets.next;

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
              <ArrowUpRight className="size-4" />
            </a>
          </Button>
        </div>
        <main className="mt-16 flex-1">
          <div className="grid items-start gap-14 lg:grid-cols-[1.05fr_0.95fr] lg:gap-20">
            <section className="min-w-0 space-y-6 animate-rise animate-delay-2">
              <h1 className="font-display text-4xl leading-tight text-foreground sm:text-5xl">
                Perfect theming for any React framework
              </h1>
              <p className="max-w-xl text-lg text-muted-foreground">
                SSR-friendly theming for React using
                cookies - with system preference,
                cross-tab sync, no flash, and a
                strongly typed{' '}
                <InlineCode>useTheme</InlineCode> hook.
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
                  <div className="flex gap-2">
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
                  setTheme(value);
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
              />
            </div>
            <CodeSnippetCard
              title="Usage example"
              description={
                <>
                  Drop in{' '}
                  <InlineCode>
                    themeScript()
                  </InlineCode>{' '}
                  +{' '}
                  <InlineCode>
                    ThemeProvider
                  </InlineCode>{' '}
                  to get no-flash theming.
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
