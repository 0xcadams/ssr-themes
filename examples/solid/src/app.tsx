import {Router} from '@solidjs/router';
import {FileRoutes} from '@solidjs/start/router';
import {Suspense} from 'solid-js';
import {
  getThemeState,
  ThemeProvider,
} from '~/lib/theme';
import './styles.css';

export default function App() {
  const themeState = getThemeState();

  return (
    <ThemeProvider {...(themeState ?? {})}>
      <Router
        root={props => (
          <Suspense>{props.children}</Suspense>
        )}
      >
        <FileRoutes />
      </Router>
    </ThemeProvider>
  );
}
