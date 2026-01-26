import {transformerTwoslash} from '@shikijs/twoslash';
import {codeToHtml} from 'shiki';
import {JsxEmit} from 'typescript';

const exampleCode = `import {ThemeProvider, useTheme} from 'ssr-themes';
import type {ReactNode} from 'react';

export function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html suppressHydrationWarning>
      <body>
        <ThemeProvider
          themes={['light', 'dark', 'quartz', 'abyss']}
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}`;

const nextRscExampleCode = `import {cookies} from 'next/headers';
import type {ReactNode} from 'react';
import {
  registerTheme,
  ThemeProvider,
} from 'ssr-themes';

export default async function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  const theme = (await cookies()).get('theme')?.value;

  return (
    <html
      suppressHydrationWarning
      {...registerTheme({theme})}
    >
      <body>
        <ThemeProvider
          initialTheme={theme}
          themes={['light', 'dark', 'quartz', 'abyss']}
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}`;

const twoslashTransformer = transformerTwoslash({
  twoslashOptions: {
    compilerOptions: {
      jsx: JsxEmit.ReactJSX,
    },
  },
});

let cachedHighlight: Promise<string> | null = null;
let cachedNextRscHighlight: Promise<string> | null =
  null;

const highlightCode = (code: string) =>
  codeToHtml(code, {
    lang: 'tsx',
    themes: {
      light: 'vitesse-light',
      dark: 'vitesse-dark',
    },
    transformers: [twoslashTransformer],
  });

export const getHighlightedCode = async () => {
  if (process.env.NODE_ENV === 'development') {
    return highlightCode(exampleCode);
  }

  if (!cachedHighlight) {
    cachedHighlight = highlightCode(exampleCode);
  }

  return cachedHighlight;
};

export const getHighlightedNextRscCode = async () => {
  if (process.env.NODE_ENV === 'development') {
    return highlightCode(nextRscExampleCode);
  }

  if (!cachedNextRscHighlight) {
    cachedNextRscHighlight = highlightCode(
      nextRscExampleCode,
    );
  }

  return cachedNextRscHighlight;
};
