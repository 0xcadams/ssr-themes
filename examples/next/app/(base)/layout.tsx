import {cookies} from 'next/headers';
import type {ReactNode} from 'react';
import Providers from '../providers';

export default async function BaseLayout({
  children,
}: {
  children: ReactNode;
}) {
  const cookieStore = await cookies();
  const themeCookie = cookieStore.get('theme')?.value;
  const initialTheme =
    themeCookie === 'dark' || themeCookie === 'light'
      ? themeCookie
      : undefined;

  return (
    <Providers initialTheme={initialTheme}>
      {children}
    </Providers>
  );
}
