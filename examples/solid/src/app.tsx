import {Router} from '@solidjs/router';
import {FileRoutes} from '@solidjs/start/router';
import {Suspense} from 'solid-js';
import {ThemeProvider} from 'ssr-themes/solid';
import {getInitialTheme} from '~/lib/theme';
import './styles.css';

export default function App() {
  const initialTheme = getInitialTheme();

  return (
    <ThemeProvider initialTheme={initialTheme}>
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
