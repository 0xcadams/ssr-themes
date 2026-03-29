import type {Handle} from '@sveltejs/kit';

import {
  htmlAttributesPlaceholder,
  parseThemeCookie,
  renderThemeHtmlAttributes,
} from '$lib/theme';

export const handle: Handle = async ({
  event,
  resolve,
}) => {
  const initialTheme = parseThemeCookie(
    event.cookies.get('theme'),
  );
  event.locals.initialTheme = initialTheme;

  return resolve(event, {
    transformPageChunk: ({html}) =>
      html.replace(
        htmlAttributesPlaceholder,
        renderThemeHtmlAttributes(initialTheme),
      ),
  });
};
