import type {ReactNode} from 'react';

import {
  metadata,
  ThemeRootLayout,
} from '../theme-root-layout';

import '../globals.css';

export {metadata};

export default function ForcedDarkLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <ThemeRootLayout forcedTheme="dark">
      {children}
    </ThemeRootLayout>
  );
}
