import {resolve, sep} from 'node:path';
import react from '@vitejs/plugin-react';
import {defineConfig} from 'vite';
import dts from 'vite-plugin-dts';

const entries = {
  index: resolve(import.meta.dirname, 'src/index.ts'),
  react: resolve(import.meta.dirname, 'src/react.tsx'),
  solid: resolve(import.meta.dirname, 'src/solid.ts'),
  vue: resolve(import.meta.dirname, 'src/vue.ts'),
  zod: resolve(import.meta.dirname, 'src/zod.ts'),
} as const;

const format =
  process.env.SSR_THEMES_FORMAT === 'cjs'
    ? 'cjs'
    : 'es';
const targetEntry = process.env.SSR_THEMES_ENTRY as
  | keyof typeof entries
  | undefined;
const libEntries = targetEntry
  ? {[targetEntry]: entries[targetEntry]}
  : entries;

export default defineConfig({
  build: {
    emptyOutDir: false,
    lib: {
      entry: libEntries,
      formats: [format],
    },
    minify: true,
    target: 'es2018',
    rollupOptions: {
      external: [
        'react',
        'react/jsx-runtime',
        'solid-js',
        'solid-js/web',
        'vue',
        'zod',
        'zod/mini',
      ],
      output:
        format === 'es'
          ? {
              entryFileNames: '[name].js',
              exports: 'named',
              format: 'es',
              preserveModules: true,
              preserveModulesRoot: 'src',
            }
          : {
              entryFileNames: '[name].cjs',
              exports: 'named',
              format: 'cjs',
            },
    },
  },
  plugins: [
    react(),
    ...(format === 'es'
      ? [
          dts({
            beforeWriteFile(filePath, content) {
              const srcSegment = `${sep}dist${sep}src${sep}`;
              if (!filePath.includes(srcSegment)) {
                return {content, filePath};
              }

              return {
                content,
                filePath: filePath.replace(
                  srcSegment,
                  `${sep}dist${sep}`,
                ),
              };
            },
            entryRoot: 'src',
            exclude: ['src/svelte/**/*'],
            include: ['src/**/*.{ts,tsx}'],
            outDir: 'dist',
            tsconfigPath: './tsconfig.build.json',
          }),
        ]
      : []),
  ],
});
