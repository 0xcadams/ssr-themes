import type {
  Attribute,
  RegisterThemeOptions,
  LightOrDark,
  ThemeHtmlAttributes,
  ThemeHtmlProps,
  ThemeStyle,
} from './types';

type RegisterThemeAttribute =
  | Attribute
  | readonly Attribute[]
  | undefined;

type RegisterThemeRenderMode =
  | 'jsx'
  | 'html-attrs'
  | 'html-string';

const escapeHtmlAttribute = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

const renderThemeStyle = (style?: ThemeStyle) => {
  if (!style) {
    return undefined;
  }

  const declarations = Object.entries(style)
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

  return declarations || undefined;
};

const toThemeHtmlAttributes = <
  TAttribute extends RegisterThemeAttribute,
>(
  props: ThemeHtmlProps<TAttribute>,
) => {
  const attributes =
    {} as ThemeHtmlAttributes<TAttribute>;

  if (props.className) {
    attributes.class = props.className;
  }

  const style = renderThemeStyle(props.style);

  if (style) {
    attributes.style = style;
  }

  for (const [name, value] of Object.entries(props)) {
    if (
      !name.startsWith('data-') ||
      typeof value !== 'string'
    ) {
      continue;
    }

    (attributes as Record<string, string | undefined>)[
      name
    ] = value;
  }

  return attributes;
};

const renderThemeAttributes = <
  TAttribute extends
    | Attribute
    | readonly Attribute[]
    | undefined,
>(
  props: ThemeHtmlProps<TAttribute>,
) => {
  const htmlAttributes = toThemeHtmlAttributes(props);
  const attributes: string[] = [];

  if (htmlAttributes.class) {
    attributes.push(
      `class="${escapeHtmlAttribute(
        htmlAttributes.class,
      )}"`,
    );
  }

  if (htmlAttributes.style) {
    attributes.push(
      `style="${escapeHtmlAttribute(
        htmlAttributes.style,
      )}"`,
    );
  }

  for (const [name, value] of Object.entries(
    htmlAttributes,
  )) {
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
):
  | string
  | ThemeHtmlAttributes<TAttribute>
  | ThemeHtmlProps<TAttribute> => {
  if (renderMode === 'html-string') {
    return renderThemeAttributes(props);
  }

  if (renderMode === 'html-attrs') {
    return toThemeHtmlAttributes(props);
  }

  return props;
};

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
    renderMode: 'html-attrs';
  },
): ThemeHtmlAttributes<TAttribute>;

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
):
  | string
  | ThemeHtmlAttributes<TAttribute>
  | ThemeHtmlProps<TAttribute> {
  const {
    selected,
    resolved,
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
    resolved ??
    (selected === 'system' ? undefined : selected);

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
