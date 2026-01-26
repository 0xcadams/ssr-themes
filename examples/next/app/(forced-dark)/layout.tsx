import type {ReactNode} from 'react';
import Providers from '../providers';

export default function ForcedDarkLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <Providers forcedTheme="dark">
      {children}
    </Providers>
  );
}
