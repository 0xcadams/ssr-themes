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
  className,
  style,
}: RegisterThemeOptions<TThemes> = {}): ThemeHtmlProps => {
  const props: ThemeHtmlProps = {};
  if (className) {
    props.className = className;
  }
  if (style) {
    props.style = {...style};
  }

  if (!theme || theme === 'system') return props;

  const name = value ? value[theme] : theme;
  if (!name) return props;
  const attributes = Array.isArray(attribute) ? attribute : [attribute];

  for (const attr of attributes) {
    if (attr === 'class') {
      props.className = props.className
        ? `${props.className} ${name}`.trim()
        : name;
    } else {
      props[attr] = name;
    }
  }

  if (enableColorScheme && (theme === 'light' || theme === 'dark')) {
    props.style = {...(props.style ?? {}), colorScheme: theme};
  }

  return props;
};
