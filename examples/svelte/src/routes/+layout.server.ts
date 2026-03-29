import type {LayoutServerLoad} from './$types';

export const load: LayoutServerLoad = ({locals}) => ({
  initialTheme: locals.initialTheme,
});
