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
    <ThemeProvider attribute="class" themes={["light", "dark", "quartz", "abyss"]}>
      {children}
    </ThemeProvider>
  );
}`;

const nextRscExampleCode = `import {cookies} from "next/headers";
import type {ReactNode} from "react";
import {registerTheme} from "ssr-themes";
import Providers from "./providers";

export default async function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  const cookieStore = await cookies();
  const themeCookie = cookieStore.get("theme")?.value;
  const theme =
    themeCookie === "dark" || themeCookie === "light" ? themeCookie : undefined;
  const themeProps = registerTheme({theme, attribute: "data-theme"});

  return (
    <html suppressHydrationWarning {...themeProps}>
      <body>
        <Providers initialTheme={theme}>{children}</Providers>
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
