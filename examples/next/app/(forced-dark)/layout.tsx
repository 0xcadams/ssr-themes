import type {ReactNode} from 'react';
import {ThemeProvider} from 'ssr-themes/client';

export default function ForcedDarkLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <ThemeProvider forcedTheme="dark">
      {children}
    </ThemeProvider>
  );
}
