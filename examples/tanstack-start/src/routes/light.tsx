import {
  Link,
  createFileRoute,
} from '@tanstack/react-router';

export const Route = createFileRoute('/light')({
  staticData: {theme: 'light'},
  component: LightPage,
});

function LightPage() {
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
