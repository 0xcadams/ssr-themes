import type {
  LightOrDark,
  ThemeCookieState,
} from 'ssr-themes';

declare global {
  namespace App {
    interface Locals {
      themeState?: ThemeCookieState<LightOrDark>;
    }

    interface PageData {
      themeState?: ThemeCookieState<LightOrDark>;
    }
  }
}

export {};
