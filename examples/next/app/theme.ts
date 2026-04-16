import {createTheme} from 'ssr-themes';

export const theme = createTheme({
  cookie: {
    secure: true,
  },
});

export const {
  defaultVariant,
  decodeVariant,
  encodeVariant,
  options,
  registerTheme,
  parseThemeCookie,
  themeScript,
  listVariants,
} = theme;
