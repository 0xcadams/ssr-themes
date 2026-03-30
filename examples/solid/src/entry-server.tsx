// @refresh reload
import type {JSX} from 'solid-js';
import {
  createHandler,
  StartServer,
} from '@solidjs/start/server';
import {registerTheme, themeScript} from 'ssr-themes';
import {getInitialTheme} from '~/lib/theme';

export default createHandler(() => (
  <StartServer
    document={({assets, children, scripts}) => {
      const initialTheme = getInitialTheme();
      const htmlProps = registerTheme({initialTheme});

      return (
        <html
          lang="en"
          class={htmlProps.className}
          style={htmlProps.style as JSX.CSSProperties}
        >
          <head>
            <meta charset="utf-8" />
            <meta
              name="viewport"
              content="width=device-width, initial-scale=1"
            />
            <link
              rel="preconnect"
              href="https://fonts.googleapis.com"
            />
            <link
              rel="preconnect"
              href="https://fonts.gstatic.com"
              crossOrigin="anonymous"
            />
            <link
              rel="stylesheet"
              href="https://fonts.googleapis.com/css2?family=Fira+Mono:wght@400;500;700&display=swap"
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
