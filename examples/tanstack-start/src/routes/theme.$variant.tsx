import {
  createFileRoute,
  notFound,
} from '@tanstack/react-router';
import {HomePage} from '../components/home-page';
import {decodeVariant} from '../lib/theme';

export const Route = createFileRoute(
  '/theme/$variant',
)({
  loader: ({params}) => {
    if (!decodeVariant(params.variant)) {
      throw notFound();
    }
  },
  component: HomePage,
});
