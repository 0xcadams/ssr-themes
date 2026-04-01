import type {Handle} from '@sveltejs/kit';

import {
  getThemeState,
  htmlAttributesPlaceholder,
  renderThemeHtmlAttributes,
  renderThemeScript,
  themeScriptPlaceholder,
} from '$lib/theme';

export const handle: Handle = async ({
  event,
  resolve,
}) => {
  const themeState = getThemeState(
    event.request.headers.get('cookie'),
  );
  event.locals.themeState = themeState;

  return resolve(event, {
    transformPageChunk: ({html}) =>
      html
        .replace(
          htmlAttributesPlaceholder,
          renderThemeHtmlAttributes(themeState),
        )
        .replace(
          themeScriptPlaceholder,
          renderThemeScript(),
        ),
  });
};
