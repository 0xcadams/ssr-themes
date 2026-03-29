import {registerTheme} from './register-theme';
import type {
  LightOrDark,
  RegisterThemeOptions,
  ThemeHtmlProps,
} from './types';

const escapeHtmlAttribute = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

const serializeStyleName = (name: string) => {
  if (name.startsWith('--')) return name;

  return name.replace(
    /[A-Z]/g,
    match => `-${match.toLowerCase()}`,
  );
};

const serializeStyleValue = (
  style: ThemeHtmlProps['style'],
) => {
  if (!style) return undefined;

  const rules = Object.entries(style)
    .filter(([, value]) => value !== undefined)
    .map(
      ([name, value]) =>
        `${serializeStyleName(name)}:${String(value)}`,
    );

  if (rules.length === 0) return undefined;

  return rules.join(';');
};

export const renderThemeAttributes = <
  TTheme extends string = LightOrDark,
>(
  options: RegisterThemeOptions<TTheme> = {},
) => {
  const props = registerTheme(options);
  const attributes: string[] = [];

  if (props.className) {
    attributes.push(
      `class="${escapeHtmlAttribute(props.className)}"`,
    );
  }

  const style = serializeStyleValue(props.style);
  if (style) {
    attributes.push(
      `style="${escapeHtmlAttribute(style)}"`,
    );
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
