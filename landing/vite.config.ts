import {defineConfig} from 'vite';
import {tanstackStart} from '@tanstack/react-start/plugin/vite';
import viteReact from '@vitejs/plugin-react';
import viteTsConfigPaths from 'vite-tsconfig-paths';
import tailwindcss from '@tailwindcss/vite';
import {nitro} from 'nitro/vite';

const nitroPreset = process.env.VERCEL
  ? 'vercel'
  : 'bun';

const config = defineConfig({
  server: {
    port: 4042,
  },
  plugins: [
    nitro({
      preset: nitroPreset,
      traceDeps: ['typescript'],
      vercel: {
        entryFormat: 'node',
      },
    }),
    viteTsConfigPaths({
      projects: ['./tsconfig.json'],
    }),
    tailwindcss(),
    tanstackStart(),
    viteReact(),
  ],
});

export default config;
