import {codeToHtml} from 'shiki';

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

const getTwoslashTransformers = async () => {
  const [{transformerTwoslash}, {JsxEmit}] =
    await Promise.all([
      import('@shikijs/twoslash'),
      import('typescript'),
    ]);

  return [
    transformerTwoslash({
      twoslashOptions: {
        compilerOptions: {
          jsx: JsxEmit.ReactJSX,
        },
      },
    }),
  ];
};

let cachedTwoslashTransformers: ReturnType<
  typeof getTwoslashTransformers
> | null = null;

let cachedHighlight: Promise<string> | null = null;
let cachedNextRscHighlight: Promise<string> | null =
  null;

const highlightCode = async (code: string) => {
  if (!cachedTwoslashTransformers) {
    cachedTwoslashTransformers =
      getTwoslashTransformers();
  }

  const transformers =
    await cachedTwoslashTransformers;

  return codeToHtml(code, {
    lang: 'tsx',
    themes: {
      light: 'vitesse-light',
      dark: 'vitesse-dark',
    },
    transformers,
  });
};

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
