import {createTheme} from 'ssr-themes';
import {bindTheme} from 'ssr-themes/vue';

const theme = createTheme({
  cookie: {
    secure: true,
  },
});

export const {
  encodeVariant,
  options,
  registerTheme,
  parseThemeCookie,
  themeScript,
} = theme;

export const {ThemeProvider, useTheme} =
  bindTheme(theme);
