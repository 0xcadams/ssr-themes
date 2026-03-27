import type {
  RegisterThemeOptions,
  LightOrDark,
  ThemeHtmlProps,
} from './types';

export const registerTheme = <
  TTheme extends string = LightOrDark,
>({
  initialTheme,
  attribute = 'class',
  value,
  enableColorScheme = true,
  className,
  style,
}: RegisterThemeOptions<TTheme> = {}): ThemeHtmlProps => {
  const props: ThemeHtmlProps = {};
  if (className) {
    props.className = className;
  }
  if (style) {
    props.style = {...style};
  }

  if (!initialTheme || initialTheme === 'system')
    return props;

  const name = value
    ? value[initialTheme]
    : initialTheme;
  if (!name) return props;
  const attributes = Array.isArray(attribute)
    ? attribute
    : [attribute];

  for (const attr of attributes) {
    if (attr === 'class') {
      props.className = props.className
        ? `${props.className} ${name}`.trim()
        : name;
    } else {
      props[attr] = name;
    }
  }

  if (
    enableColorScheme &&
    (initialTheme === 'light' ||
      initialTheme === 'dark')
  ) {
    props.style = {
      ...(props.style ?? {}),
      colorScheme: initialTheme,
    };
  }

  return props;
};
