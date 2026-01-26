import Link from 'next/link';

export default function Page() {
  return (
    <main className="flex min-h-screen w-full items-center justify-center px-6">
      <Link
        className="text-lg underline underline-offset-4"
        href="/"
      >
        Go back home
      </Link>
    </main>
  );
}
