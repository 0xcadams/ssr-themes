import {bindTheme} from 'ssr-themes/react';
import {themeOptions} from './theme';

export const {ThemeProvider, useTheme} =
  bindTheme(themeOptions);
