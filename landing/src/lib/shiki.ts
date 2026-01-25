import {codeToHtml} from 'shiki';

const exampleCode = `import {ThemeProvider, useTheme} from "ssr-themes";

export function ThemePreview() {
  const {theme, setTheme} = useTheme();

  return (
    <button onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
      Toggle theme
    </button>
  );
}

export function RootLayout({children}) {
  return (
    <ThemeProvider themes={["light", "dark", "quartz", "abyss"]}>
      {children}
    </ThemeProvider>
  );
}`;

const nextRscExampleCode = `import {cookies} from "next/headers";
import type {ReactNode} from "react";
import {registerTheme, ThemeProvider} from "ssr-themes";

export default function RootLayout({children}: {children: ReactNode}) {
  const theme = cookies().get("theme")?.value;

  return (
    <html suppressHydrationWarning {...registerTheme({theme})}>
      <body>
        <ThemeProvider
          initialTheme={theme}
          themes={["light", "dark", "quartz", "abyss"]}
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}`;

let cachedHighlight: Promise<string> | null = null;
let cachedNextRscHighlight: Promise<string> | null = null;

const highlightCode = (code: string) =>
  codeToHtml(code, {
    lang: 'tsx',
    themes: {
      light: 'vitesse-light',
      dark: 'vitesse-dark',
    },
  });

export const getHighlightedCode = async () => {
  if (!cachedHighlight) {
    cachedHighlight = highlightCode(exampleCode);
  }

  return cachedHighlight;
};

export const getHighlightedNextRscCode = async () => {
  if (!cachedNextRscHighlight) {
    cachedNextRscHighlight = highlightCode(nextRscExampleCode);
  }

  return cachedNextRscHighlight;
};
