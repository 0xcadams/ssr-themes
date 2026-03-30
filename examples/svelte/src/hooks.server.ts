import type {Handle} from '@sveltejs/kit';

import {
  getInitialTheme,
  htmlAttributesPlaceholder,
  renderThemeHtmlAttributes,
} from '$lib/theme';

export const handle: Handle = async ({
  event,
  resolve,
}) => {
  const initialTheme = getInitialTheme(
    event.request.headers.get('cookie'),
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
