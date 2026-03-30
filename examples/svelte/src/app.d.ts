import type {
  LightOrDark,
  WithSystem,
} from 'ssr-themes';

declare global {
  namespace App {
    interface Locals {
      initialTheme?: WithSystem<LightOrDark>;
    }

    interface PageData {
      initialTheme?: WithSystem<LightOrDark>;
    }
  }
}

export {};
