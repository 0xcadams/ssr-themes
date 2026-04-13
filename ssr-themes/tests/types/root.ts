import {
  createTheme,
  type AttributeFromOptions,
  type CreatedTheme,
  type EncodedThemeVariant,
  type EnableSystemFromOptions,
  type LightOrDark,
  type RegisterThemeRuntimeOptions,
  type ResolvedThemeState,
  type ThemeHtmlAttributes,
  type ThemeHtmlProps,
  type ThemeNameFromOptions,
  type ThemeOptions,
  type ThemeOptionsFromBindInput,
  type ThemeProviderRuntimeProps,
  type ThemeState,
  type ThemeVariant,
  type WithSystem,
} from 'ssr-themes';

import {expectType, type AssertEqual} from './assert';

const defaultTheme = createTheme();

expectType<
  AssertEqual<
    typeof defaultTheme.defaultVariant,
    EncodedThemeVariant<LightOrDark, true>
  >
>();

expectType<
  AssertEqual<
    Parameters<typeof defaultTheme.encodeVariant>[0],
    ThemeState<LightOrDark, true> | undefined
  >
>();

const rootTheme = createTheme({
  themes: ['light', 'dark', 'quartz'],
  defaultTheme: 'quartz',
  attribute: ['class', 'data-mode'],
});

type RootOptions = typeof rootTheme.options;

expectType<
  AssertEqual<
    typeof rootTheme.defaultVariant,
    EncodedThemeVariant<
      'light' | 'dark' | 'quartz',
      true
    >
  >
>();

expectType<
  AssertEqual<
    typeof rootTheme.options.themes,
    readonly ['light', 'dark', 'quartz']
  >
>();
expectType<
  AssertEqual<
    ThemeNameFromOptions<RootOptions>,
    'light' | 'dark' | 'quartz'
  >
>();
expectType<
  AssertEqual<
    EnableSystemFromOptions<RootOptions>,
    true
  >
>();
expectType<
  AssertEqual<
    AttributeFromOptions<RootOptions>,
    readonly ['class', 'data-mode']
  >
>();
expectType<
  AssertEqual<
    ThemeOptionsFromBindInput<typeof rootTheme>,
    RootOptions
  >
>();
expectType<
  AssertEqual<
    typeof rootTheme,
    CreatedTheme<RootOptions>
  >
>();

const runtimeProps = {
  initial: {
    selected: 'system',
    resolved: 'dark',
  },
  forced: 'quartz',
} satisfies ThemeProviderRuntimeProps<
  'light' | 'dark' | 'quartz'
>;

const registerThemeRuntime = {
  renderMode: 'html-attrs',
  forced: 'dark',
} satisfies RegisterThemeRuntimeOptions<
  'light' | 'dark' | 'quartz'
>;

const rootState = {
  selected: 'quartz',
  resolved: 'quartz',
  system: 'dark',
} satisfies ThemeState<'light' | 'dark' | 'quartz'>;

rootTheme.encodeVariant(rootState);
rootTheme.themeScript({forced: 'quartz'});

const parsedCookie =
  rootTheme.parseThemeCookie('theme=~d');
const decodedVariant = rootTheme.decodeVariant('~d');
const listedVariant = rootTheme.listVariants()[0];
const jsxProps = rootTheme.registerTheme(rootState);
const htmlAttributes = rootTheme.registerTheme(
  rootState,
  registerThemeRuntime,
);
const htmlString = rootTheme.registerTheme(rootState, {
  renderMode: 'html-string',
  forced: 'dark',
});

expectType<
  AssertEqual<
    typeof parsedCookie,
    | ResolvedThemeState<
        'light' | 'dark' | 'quartz',
        true
      >
    | undefined
  >
>();
expectType<
  AssertEqual<
    typeof decodedVariant,
    | ResolvedThemeState<
        'light' | 'dark' | 'quartz',
        true
      >
    | undefined
  >
>();
if (listedVariant) {
  expectType<
    AssertEqual<
      typeof listedVariant,
      ThemeVariant<'light' | 'dark' | 'quartz', true>
    >
  >();
}
expectType<
  AssertEqual<
    typeof jsxProps,
    ThemeHtmlProps<readonly ['class', 'data-mode']>
  >
>();
expectType<
  AssertEqual<
    typeof htmlAttributes,
    ThemeHtmlAttributes<
      readonly ['class', 'data-mode']
    >
  >
>();
expectType<AssertEqual<typeof htmlString, string>>();

const manualOptions = {
  themes: ['day', 'night'],
  enableSystem: false,
  defaultTheme: 'day',
} satisfies ThemeOptions<'day' | 'night', false>;

const noSystemTheme = createTheme(manualOptions);

expectType<
  AssertEqual<
    Parameters<typeof noSystemTheme.encodeVariant>[0],
    ThemeState<'day' | 'night', false> | undefined
  >
>();
expectType<
  AssertEqual<
    WithSystem<'day' | 'night', false>,
    'day' | 'night'
  >
>();

noSystemTheme.encodeVariant({
  selected: 'day',
  resolved: 'day',
});
noSystemTheme.registerTheme({
  selected: 'night',
  resolved: 'night',
});

// @ts-expect-error invalid forced theme should fail
rootTheme.themeScript({forced: 'sepia'});

rootTheme.encodeVariant({
  // @ts-expect-error invalid selected theme should fail
  selected: 'sepia',
  resolved: 'quartz',
});

noSystemTheme.registerTheme({
  // @ts-expect-error system should be removed when disabled
  selected: 'system',
  resolved: 'day',
});

void runtimeProps;
