import {createTheme} from 'ssr-themes';

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
