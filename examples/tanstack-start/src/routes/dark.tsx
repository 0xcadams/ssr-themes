import {
  Link,
  createFileRoute,
} from '@tanstack/react-router';

export const Route = createFileRoute('/dark')({
  staticData: {theme: 'dark'},
  component: DarkPage,
});

function DarkPage() {
  return (
    <div className="flex min-h-screen w-full items-center justify-center px-6">
      <Link
        className="text-lg underline underline-offset-4"
        to="/"
      >
        Go back
      </Link>
    </div>
  );
}
