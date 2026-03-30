import {resolve, sep} from 'node:path';
import react from '@vitejs/plugin-react';
import {defineConfig} from 'vite';
import dts from 'vite-plugin-dts';

const entries = {
  index: resolve(import.meta.dirname, 'src/index.ts'),
  react: resolve(import.meta.dirname, 'src/react.tsx'),
  solid: resolve(import.meta.dirname, 'src/solid.ts'),
  zod: resolve(import.meta.dirname, 'src/zod.ts'),
};

export default defineConfig({
  build: {
    emptyOutDir: true,
    lib: {
      entry: entries,
    },
    minify: true,
    target: 'es2018',
    rollupOptions: {
      external: [
        'react',
        'react/jsx-runtime',
        'solid-js',
        'solid-js/web',
        'zod',
      ],
      output: [
        {
          chunkFileNames: 'chunks/[name]-[hash].mjs',
          entryFileNames: '[name].mjs',
          exports: 'named',
          format: 'es',
        },
        {
          chunkFileNames: 'chunks/[name]-[hash].js',
          entryFileNames: '[name].js',
          exports: 'named',
          format: 'cjs',
        },
      ],
    },
  },
  plugins: [
    react(),
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
      include: ['src/**/*.{ts,tsx}'],
      outDir: 'dist',
      tsconfigPath: './tsconfig.build.json',
    }),
  ],
});
