import type {
  RegisterThemeOptions,
  SystemThemeDefinition,
  ThemeHtmlProps,
} from './types';

export const registerTheme = <
  TThemes extends readonly string[] = SystemThemeDefinition,
>({
  theme,
  attribute = 'class',
  value,
  enableColorScheme = true,
}: RegisterThemeOptions<TThemes> = {}): ThemeHtmlProps => {
  if (!theme || theme === 'system') return {};

  const name = value ? value[theme] : theme;
  if (!name) return {};

  const props: ThemeHtmlProps = {};
  const attributes = Array.isArray(attribute) ? attribute : [attribute];

  for (const attr of attributes) {
    if (attr === 'class') {
      props.className = name;
    } else {
      props[attr] = name;
    }
  }

  if (enableColorScheme && (theme === 'light' || theme === 'dark')) {
    props.style = {colorScheme: theme};
  }

  return props;
};
