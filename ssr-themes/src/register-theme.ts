import type {
  Attribute,
  RegisterThemeOptions,
  LightOrDark,
  ThemeHtmlProps,
} from './types';

type RegisterThemeAttribute =
  | Attribute
  | readonly Attribute[]
  | undefined;

type RegisterThemeRenderMode = 'jsx' | 'html-string';

const escapeHtmlAttribute = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

const renderThemeAttributes = <
  TAttribute extends
    | Attribute
    | readonly Attribute[]
    | undefined,
>(
  props: ThemeHtmlProps<TAttribute>,
) => {
  const attributes: string[] = [];

  if (props.className) {
    attributes.push(
      `class="${escapeHtmlAttribute(
        props.className,
      )}"`,
    );
  }

  if (props.style) {
    const declarations = Object.entries(props.style)
      .filter(([, value]) => value !== undefined)
      .map(([name, value]) => {
        const property = name.startsWith('--')
          ? name
          : name.replace(
              /[A-Z]/g,
              match => `-${match.toLowerCase()}`,
            );

        return `${property}:${String(value)}`;
      })
      .join(';');

    if (declarations) {
      attributes.push(
        `style="${escapeHtmlAttribute(declarations)}"`,
      );
    }
  }

  for (const [name, value] of Object.entries(props)) {
    if (
      !name.startsWith('data-') ||
      typeof value !== 'string'
    ) {
      continue;
    }

    attributes.push(
      `${name}="${escapeHtmlAttribute(value)}"`,
    );
  }

  return attributes.join(' ');
};

const toRegisterThemeOutput = <
  TAttribute extends RegisterThemeAttribute,
>(
  props: ThemeHtmlProps<TAttribute>,
  renderMode?: RegisterThemeRenderMode,
): string | ThemeHtmlProps<TAttribute> =>
  renderMode === 'html-string'
    ? renderThemeAttributes(props)
    : props;

export function registerTheme<
  TTheme extends string = LightOrDark,
  TEnableSystem extends boolean = true,
  TAttribute extends RegisterThemeAttribute = 'class',
>(
  options?: RegisterThemeOptions<
    TTheme,
    TEnableSystem,
    TAttribute
  > & {
    renderMode?: 'jsx' | undefined;
  },
): ThemeHtmlProps<TAttribute>;

export function registerTheme<
  TTheme extends string = LightOrDark,
  TEnableSystem extends boolean = true,
  TAttribute extends RegisterThemeAttribute = 'class',
>(
  options: RegisterThemeOptions<
    TTheme,
    TEnableSystem,
    TAttribute
  > & {
    renderMode: 'html-string';
  },
): string;

export function registerTheme<
  TTheme extends string = LightOrDark,
  TEnableSystem extends boolean = true,
  TAttribute extends RegisterThemeAttribute = 'class',
>(
  options: RegisterThemeOptions<
    TTheme,
    TEnableSystem,
    TAttribute
  > = {},
): string | ThemeHtmlProps<TAttribute> {
  const {
    selectedTheme,
    appliedTheme,
    valueMap,
    enableColorScheme = true,
    className,
    style,
    renderMode,
  } = options;
  const attribute = (options.attribute ?? 'class') as
    | Attribute
    | readonly Attribute[];
  const props = {} as ThemeHtmlProps<TAttribute>;
  const dataProps = props as ThemeHtmlProps<Attribute>;

  if (className) {
    props.className = className;
  }
  if (style) {
    props.style = {...style};
  }

  const resolvedTheme =
    appliedTheme ??
    (selectedTheme === 'system'
      ? undefined
      : selectedTheme);

  if (!resolvedTheme) {
    return toRegisterThemeOutput(props, renderMode);
  }

  const name = valueMap
    ? valueMap[resolvedTheme as TTheme]
    : resolvedTheme;
  if (!name) {
    return toRegisterThemeOutput(props, renderMode);
  }

  const attributes = Array.isArray(attribute)
    ? attribute
    : [attribute];

  for (const attr of attributes as readonly Attribute[]) {
    if (attr === 'class') {
      props.className = props.className
        ? `${props.className} ${name}`.trim()
        : name;
    } else {
      dataProps[attr] = name;
    }
  }

  if (
    enableColorScheme &&
    (resolvedTheme === 'light' ||
      resolvedTheme === 'dark')
  ) {
    props.style = {
      ...(props.style ?? {}),
      colorScheme: resolvedTheme,
    };
  }

  return toRegisterThemeOutput(props, renderMode);
}
