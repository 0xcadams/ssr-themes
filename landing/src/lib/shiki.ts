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

let cachedHighlight: Promise<string> | null = null;

export const getHighlightedCode = async () => {
  if (!cachedHighlight) {
    cachedHighlight = codeToHtml(exampleCode, {
      lang: 'tsx',
      themes: {
        light: 'vitesse-light',
        dark: 'vitesse-dark',
      },
    });
  }

  return cachedHighlight;
};
