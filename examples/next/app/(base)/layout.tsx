import type {ReactNode} from 'react';

import {
  metadata,
  ThemeRootLayout,
} from '../theme-root-layout';

import '../globals.css';

export {metadata};

export default function BaseLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <ThemeRootLayout>{children}</ThemeRootLayout>;
}
