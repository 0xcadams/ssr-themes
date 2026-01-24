import type {ReactNode} from 'react';
import Providers from '../providers';

export default function ForcedDarkLayout({children}: {children: ReactNode}) {
  return (
    <Providers forcedTheme="dark" initialTheme="dark">
      {children}
    </Providers>
  );
}
