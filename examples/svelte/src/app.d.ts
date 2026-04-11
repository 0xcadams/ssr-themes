import type {
  LightOrDark,
  ResolvedThemeState,
} from 'ssr-themes';

declare global {
  namespace App {
    interface Locals {
      themeState?: ResolvedThemeState<LightOrDark>;
    }

    interface PageData {
      themeState?: ResolvedThemeState<LightOrDark>;
    }
  }
}

export {};
