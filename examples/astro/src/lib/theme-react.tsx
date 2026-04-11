import {bindTheme} from 'ssr-themes/react';
import {options} from './theme';

export const {ThemeProvider, useTheme} =
  bindTheme(options);
