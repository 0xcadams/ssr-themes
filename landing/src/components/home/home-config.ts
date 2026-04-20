import type { FrameworkId } from '@/lib/shiki';

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
    value: 'astro',
    label: 'Astro',
    secondaryTitle: 'Theme switcher',
    secondaryDescription:
      'Bind the React island once, then call useTheme() in a tiny select.',
  },
  {
    value: 'next',
    label: 'Next.js',
    secondaryTitle: 'Theme switcher',
    secondaryDescription:
      'Bind the React client helper once, then switch themes from a client component.',
  },
  {
    value: 'nuxt',
    label: 'Nuxt',
    secondaryTitle: 'Theme switcher',
    secondaryDescription:
      'Use the Vue binding in a small select component.',
  },
  {
    value: 'react-router',
    label: 'React Router',
    secondaryTitle: 'Theme switcher',
    secondaryDescription:
      'Load theme state in the root route, then call useTheme() in a tiny route component.',
  },
  {
    value: 'solid',
    label: 'Solid',
    secondaryTitle: 'Theme switcher',
    secondaryDescription:
      'Read selected() and call setSelected(...) from a Solid component.',
  },
  {
    value: 'svelte',
    label: 'SvelteKit',
    secondaryTitle: 'Theme switcher',
    secondaryDescription:
      'Use the Svelte stores from useTheme() in a tiny select.',
  },
  {
    value: 'tanstack',
    label: 'TanStack Start',
    secondaryTitle: 'Theme switcher',
    secondaryDescription:
      'Bind the React helper once, then call useTheme() in a route component.',
  },
  {
    value: 'other',
    label: 'Other',
    secondaryTitle: 'Theme switcher',
    secondaryDescription:
      'Bind the client helper once and call useTheme() anywhere.',
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
    href: 'https://react-router.ssr-themes.cadams.io',
    label: 'React Router',
  },
  {
    href: 'https://solid.ssr-themes.cadams.io',
    label: 'Solid',
  },
  {
    href: 'https://svelte.ssr-themes.cadams.io',
    label: 'Svelte',
  },
  {
    href: 'https://vue.ssr-themes.cadams.io',
    label: 'Vue',
  },
  {
    href: 'https://astro.ssr-themes.cadams.io',
    label: 'Astro',
  },
] as const;
