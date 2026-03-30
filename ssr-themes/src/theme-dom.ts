import type {Attribute} from './types';

export const disableThemeTransitions = (
  nonce?: string,
) => {
  const css = document.createElement('style');
  if (nonce) {
    css.setAttribute('nonce', nonce);
  }
  css.appendChild(
    document.createTextNode(
      `*,*::before,*::after{-webkit-transition:none!important;-moz-transition:none!important;-o-transition:none!important;-ms-transition:none!important;transition:none!important}`,
    ),
  );
  document.head.appendChild(css);

  return () => {
    (() => window.getComputedStyle(document.body))();

    setTimeout(() => {
      document.head.removeChild(css);
    }, 1);
  };
};

export const updateThemeAttributes = (
  element: HTMLElement,
  attributes: readonly Attribute[],
  classNames: readonly string[],
  nextName: string | undefined,
) => {
  for (const attribute of attributes) {
    if (attribute === 'class') {
      element.classList.remove(...classNames);
      if (nextName) {
        element.classList.add(nextName);
      }
    } else if (nextName) {
      element.setAttribute(attribute, nextName);
    } else {
      element.removeAttribute(attribute);
    }
  }
};

export const updateThemeColorScheme = (
  element: HTMLElement,
  resolvedTheme: string,
  enableColorScheme: boolean,
) => {
  if (!enableColorScheme) {
    return;
  }

  element.style.colorScheme =
    resolvedTheme === 'light' ||
    resolvedTheme === 'dark'
      ? resolvedTheme
      : '';
};
