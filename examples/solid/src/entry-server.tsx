// @refresh reload
import {
  createHandler,
  StartServer,
} from '@solidjs/start/server';
import {
  getThemeState,
  registerTheme,
  themeScript,
} from '~/lib/theme';

export default createHandler(() => (
  <StartServer
    document={({assets, children, scripts}) => {
      const themeState = getThemeState();
      const htmlProps = registerTheme(themeState, {
        renderMode: 'html-attrs',
      });

      return (
        <html
          lang="en"
          class={htmlProps.class}
          style={htmlProps.style}
        >
          <head>
            <meta charset="utf-8" />
            <meta
              name="viewport"
              content="width=device-width, initial-scale=1"
            />
            <script
              id="ssr-themes"
              innerHTML={themeScript()}
            />
            {assets}
          </head>
          <body class="min-h-screen bg-white font-mono text-black antialiased dark:bg-black dark:text-white">
            <div id="app">{children}</div>
            {scripts}
          </body>
        </html>
      );
    }}
  />
));
