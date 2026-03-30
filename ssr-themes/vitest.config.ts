import {defineConfig} from 'vitest/config';

export default defineConfig({
  resolve: {
    alias: [
      {
        find: 'solid-js/web',
        replacement: 'solid-js/web/dist/web.js',
      },
      {
        find: /^solid-js$/,
        replacement: 'solid-js/dist/solid.js',
      },
    ],
  },
});
