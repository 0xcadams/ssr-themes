import type {FrameworkId} from '@/lib/shiki';

export type ThemeValue =
  | 'system'
  | 'light'
  | 'dark'
  | 'quartz'
  | 'abyss';

export type ThemeOption = {
  value: ThemeValue;
  label: string;
  note: string;
  caption: string;
  previewClass: string;
};

export const themeOptions: ThemeOption[] = [
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

export const packageManagers = [
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

export type PackageManager =
  (typeof packageManagers)[number]['value'];

export const packageManagerStorageKey =
  'ssrthemes-package-manager';

export const frameworks = [
  {
    value: 'tanstack',
    label: 'TanStack Start',
    secondaryTitle: 'Forced theme routes',
    secondaryDescription:
      'Use route staticData to force a theme per route.',
  },
  {
    value: 'next',
    label: 'Next.js',
    secondaryTitle: 'RSC support',
    secondaryDescription:
      'Read cookies on the server and hydrate the initial theme.',
  },
  {
    value: 'nuxt',
    label: 'Nuxt',
    secondaryTitle: 'useHead SSR',
    secondaryDescription:
      'Read the cookie on the server, pre-set <html> with useHead(), and hydrate the Vue binding after render.',
  },
  {
    value: 'solid',
    label: 'Solid',
    secondaryTitle: 'Accessor-based UI',
    secondaryDescription:
      'Call theme() in your route and update the cookie-backed theme with setTheme(...).',
  },
  {
    value: 'svelte',
    label: 'SvelteKit',
    secondaryTitle: 'Hook-based html SSR',
    secondaryDescription:
      'Inject html attrs and the bootstrap script via app.html + hooks.server.ts, then read theme stores from getTheme().',
  },
  {
    value: 'astro',
    label: 'Astro',
    secondaryTitle: 'React island',
    secondaryDescription:
      'Read the cookie in .astro, pre-set <html>, and hydrate a tiny React switcher with client:load.',
  },
  {
    value: 'other',
    label: 'Other',
    secondaryTitle: 'SSR cookies',
    secondaryDescription:
      'Parse a raw Cookie header and pre-set the <html> theme.',
  },
] as const satisfies readonly {
  value: FrameworkId;
  label: string;
  secondaryTitle: string;
  secondaryDescription: string;
}[];

export type Framework =
  (typeof frameworks)[number]['value'];

export const frameworkStorageKey =
  'ssrthemes-framework';

export const liveDemoLinks = [
  {
    href: 'https://start.ssr-themes.cadams.io',
    label: 'TanStack Start',
  },
  {
    href: 'https://next.ssr-themes.cadams.io',
    label: 'Next.js',
  },
  {
    href: 'https://solid.ssr-themes.cadams.io',
    label: 'Solid',
  },
  {
    href: 'https://astro.ssr-themes.cadams.io',
    label: 'Astro',
  },
] as const;
