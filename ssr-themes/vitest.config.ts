import solid from 'vite-plugin-solid';
import {defineConfig} from 'vitest/config';
import {inlineScriptPlugin} from './inline-script-plugin';

export default defineConfig({
  plugins: [
    inlineScriptPlugin(),
    solid({
      include: ['tests/solid.test.tsx'],
    }),
  ],
  resolve: {
    conditions: ['development', 'browser'],
  },
});
