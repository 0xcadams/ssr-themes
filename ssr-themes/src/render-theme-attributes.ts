import {registerTheme} from './register-theme';
import type {
  LightOrDark,
  RegisterThemeOptions,
} from './types';

const escapeHtmlAttribute = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

export const renderThemeAttributes = <
  TTheme extends string = LightOrDark,
>(
  options: RegisterThemeOptions<TTheme> = {},
) => {
  const {className, style, ...props} =
    registerTheme(options);
  const attributes: string[] = [];

  if (className) {
    attributes.push(
      `class="${escapeHtmlAttribute(className)}"`,
    );
  }

  if (style) {
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
