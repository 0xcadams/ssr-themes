import type {ReactNode} from 'react';
import {ThemeProvider} from 'ssr-themes/react';

export default function ForcedLightLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <ThemeProvider forcedTheme="light">
      {children}
    </ThemeProvider>
  );
}
