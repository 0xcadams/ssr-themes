import type {ReactNode} from 'react';
import Providers from '../providers';

export default function ForcedLightLayout({children}: {children: ReactNode}) {
  return (
    <Providers forcedTheme="light" initialTheme="light">
      {children}
    </Providers>
  );
}
