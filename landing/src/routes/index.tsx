import {createFileRoute} from '@tanstack/react-router';
import {useTheme} from 'ssr-themes';
import {useEffect, useState} from 'react';
import {Button} from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  ToggleGroup,
  ToggleGroupItem,
} from '@/components/ui/toggle-group';
import {
  ArrowUpRight,
  Check,
  Copy,
  ShieldCheck,
} from 'lucide-react';
import {getHighlightedFrameworkSnippets} from '@/lib/shiki';

type ThemeOption = {
  value:
    | 'system'
    | 'light'
    | 'dark'
    | 'quartz'
    | 'abyss';
  label: string;
  note: string;
  caption: string;
  previewClass: string;
};

const themeOptions: ThemeOption[] = [
  {
    value: 'system',
    label: 'System',
    note: 'Auto',
    caption: 'Balanced by OS',
    previewClass: 'theme-preview-system',
  },
  {
    value: 'light',
    label: 'Light',
    note: 'Paper',
    caption: 'Crisp contrast',
    previewClass: 'theme-preview-light',
  },
  {
    value: 'dark',
    label: 'Dark',
    note: 'Studio',
    caption: 'Low glare',
    previewClass: 'theme-preview-dark',
  },
  {
    value: 'quartz',
    label: 'Quartz',
    note: 'Glacier',
    caption: 'Cool glass',
    previewClass: 'theme-preview-quartz',
  },
  {
    value: 'abyss',
    label: 'Abyss',
    note: 'Deep',
    caption: 'Ocean night',
    previewClass: 'theme-preview-abyss',
  },
];

const packageManagers = [
  {
    value: 'bun',
    label: 'bun',
    command: 'bun add ssr-themes',
  },
  {
    value: 'pnpm',
    label: 'pnpm',
    command: 'pnpm add ssr-themes',
  },
  {
    value: 'npm',
    label: 'npm',
    command: 'npm install ssr-themes',
  },
  {
    value: 'yarn',
    label: 'yarn',
    command: 'yarn add ssr-themes',
  },
] as const;

type PackageManager =
  (typeof packageManagers)[number]['value'];

const packageManagerStorageKey =
  'ssrthemes-package-manager';

const frameworks = [
  {
    value: 'next',
    label: 'Next.js',
    secondaryTitle: 'SSR / RSC support',
    secondaryDescription:
      'Read cookies on the server and hydrate the initial theme.',
  },
  {
    value: 'tanstack',
    label: 'TanStack Start',
    secondaryTitle: 'Forced theme routes',
    secondaryDescription:
      'Use route staticData to force a theme per route.',
  },
  {
    value: 'other',
    label: 'Other',
    secondaryTitle: 'SSR cookie parsing',
    secondaryDescription:
      'Parse a raw Cookie header and pre-set the <html> theme.',
  },
] as const;

type Framework = (typeof frameworks)[number]['value'];

const frameworkStorageKey = 'ssrthemes-framework';

function ThemeTile({
  option,
  note,
  isActive,
  onSelect,
}: {
  option: ThemeOption;
  note: string;
  isActive: boolean;
  onSelect: (value: ThemeOption['value']) => void;
}) {
  return (
    <button
      type="button"
      className="theme-tile"
      data-active={isActive}
      aria-pressed={isActive}
      onClick={() => onSelect(option.value)}
    >
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium">
          {option.label}
        </span>
        <span className="text-xs text-muted-foreground">
          {note}
        </span>
      </div>
      <div
        className={`theme-preview ${option.previewClass}`}
      />
      <div className="flex items-center text-xs text-muted-foreground">
        <span>{option.caption}</span>
      </div>
    </button>
  );
}

function IndexPage() {
  const {theme, setTheme, systemTheme} =
    useTheme<ThemeOption['value']>();
  const [mounted, setMounted] = useState(false);
  const [framework, setFramework] =
    useState<Framework>('next');
  const [packageManager, setPackageManager] =
    useState<PackageManager>('bun');
  const [copied, setCopied] = useState(false);
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

  const activeFrameworkValue = mounted
    ? framework
    : ('next' satisfies Framework);
  const activeFramework =
    frameworks.find(
      candidate =>
        candidate.value === activeFrameworkValue,
    ) ?? frameworks[0];
  const activeSnippet =
    frameworkSnippets[activeFrameworkValue] ??
    frameworkSnippets.next;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(
        installCommand,
      );
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

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
                <span className="rounded-md border border-primary/20 bg-primary/10 px-1.5 py-0.5 font-mono text-[0.75rem] text-primary/90">
                  useTheme
                </span>{' '}
                hook.
              </p>
              <div className="space-y-6">
                <div className="flex flex-col gap-3">
                  <ToggleGroup
                    type="single"
                    value={packageManager}
                    onValueChange={(value: string) => {
                      if (value)
                        setPackageManager(
                          value as PackageManager,
                        );
                    }}
                    variant="outline"
                    size="sm"
                    className="bg-card/70 backdrop-blur"
                  >
                    {packageManagers.map(manager => (
                      <ToggleGroupItem
                        key={manager.value}
                        value={manager.value}
                        className="text-[0.7rem] font-medium"
                      >
                        {manager.label}
                      </ToggleGroupItem>
                    ))}
                  </ToggleGroup>
                  <div className="flex">
                    <div className="flex items-center gap-2 rounded-md border border-border/70 bg-card/70 px-3 py-2 shadow-xs">
                      <span className="font-mono text-[0.75rem] text-foreground/80">
                        {installCommand}
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-xs"
                        onClick={handleCopy}
                        aria-label="Copy install command"
                        title={
                          copied ? 'Copied' : 'Copy'
                        }
                      >
                        {copied ? (
                          <Check className="size-3.5" />
                        ) : (
                          <Copy className="size-3.5" />
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <span className="text-[0.7rem] text-muted-foreground/80">
                    Live demos
                  </span>
                  <div className="flex gap-2">
                    <Button
                      asChild
                      variant="outline"
                      size="sm"
                      className="bg-card/70 backdrop-blur"
                    >
                      <a
                        target="_blank"
                        href="https://start.ssr-themes.cadams.io"
                      >
                        TanStack Start
                      </a>
                    </Button>
                    <Button
                      asChild
                      variant="outline"
                      size="sm"
                      className="bg-card/70 backdrop-blur"
                    >
                      <a
                        target="_blank"
                        href="https://next.ssr-themes.cadams.io"
                      >
                        Next.js
                      </a>
                    </Button>
                  </div>
                </div>
              </div>
            </section>

            <section className="min-w-0 animate-rise animate-delay-3">
              <Card className="min-w-0 border-border/60 bg-card/70 backdrop-blur">
                <CardHeader className="border-b border-border/60">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <CardTitle className="text-base">
                        Theme picker
                      </CardTitle>
                      <CardDescription>
                        Pick a palette and the UI
                        updates instantly.
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-5">
                  <div className="grid gap-3 sm:grid-cols-2">
                    {themeOptions.map(option => (
                      <ThemeTile
                        key={option.value}
                        option={option}
                        note={
                          option.value === 'system'
                            ? systemNote
                            : option.note
                        }
                        isActive={
                          activeTheme === option.value
                        }
                        onSelect={setTheme}
                      />
                    ))}
                  </div>
                  <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
                    <ShieldCheck className="h-3.5 w-3.5 text-primary" />
                    Hydration-safe changes that sync
                    across tabs.
                  </div>
                </CardContent>
              </Card>
            </section>
          </div>

          <div className="mt-14 grid gap-6 text-left animate-rise animate-delay-4 lg:mt-16 max-w-2xl">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
              <ToggleGroup
                type="single"
                value={framework}
                onValueChange={(value: string) => {
                  if (value) {
                    setFramework(value as Framework);
                  }
                }}
                variant="outline"
                size="sm"
                className="bg-card/70 backdrop-blur"
              >
                {frameworks.map(option => (
                  <ToggleGroupItem
                    key={option.value}
                    value={option.value}
                    className="text-[0.7rem] font-medium"
                  >
                    {option.label}
                  </ToggleGroupItem>
                ))}
              </ToggleGroup>
            </div>
            <Card className="min-w-0 border-border/60 bg-card/70 backdrop-blur">
              <CardHeader>
                <CardTitle className="text-base">
                  Usage example
                </CardTitle>
                <CardDescription>
                  Drop in{' '}
                  <span className="rounded-md border border-primary/20 bg-primary/10 px-1.5 py-0.5 font-mono text-[0.75rem] text-primary/90">
                    themeScript()
                  </span>{' '}
                  +{' '}
                  <span className="rounded-md border border-primary/20 bg-primary/10 px-1.5 py-0.5 font-mono text-[0.75rem] text-primary/90">
                    ThemeProvider
                  </span>{' '}
                  to get no-flash theming.
                </CardDescription>
              </CardHeader>
              <CardContent className="code-block min-w-0 pt-0">
                <div
                  className="max-w-full overflow-x-auto"
                  dangerouslySetInnerHTML={{
                    __html: activeSnippet.primaryHtml,
                  }}
                />
              </CardContent>
            </Card>

            <Card className="min-w-0 border-border/60 bg-card/70 backdrop-blur">
              <CardHeader>
                <CardTitle className="text-base">
                  {activeFramework.secondaryTitle}
                </CardTitle>
                <CardDescription>
                  {
                    activeFramework.secondaryDescription
                  }
                </CardDescription>
              </CardHeader>
              <CardContent className="code-block min-w-0 pt-0">
                <div
                  className="max-w-full overflow-x-auto"
                  dangerouslySetInnerHTML={{
                    __html:
                      activeSnippet.secondaryHtml,
                  }}
                />
              </CardContent>
            </Card>
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
