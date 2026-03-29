import {defineConfig} from 'tsup';

export default defineConfig({
  entry: [
    'src/index.ts',
    'src/react.tsx',
    'src/zod.ts',
  ],
  sourcemap: false,
  minify: true,
  dts: true,
  clean: true,
  external: ['react', 'zod'],
  format: ['esm', 'cjs'],
  splitting: false,
  bundle: true,
});
