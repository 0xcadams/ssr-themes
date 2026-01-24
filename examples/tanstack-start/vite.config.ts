import {resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {defineConfig} from 'vite';
import {tanstackStart} from '@tanstack/react-start/plugin/vite';
import viteReact from '@vitejs/plugin-react';
import viteTsConfigPaths from 'vite-tsconfig-paths';
import tailwindcss from '@tailwindcss/vite';
import {nitro} from 'nitro/vite';

const rootDir = resolve(fileURLToPath(new URL('.', import.meta.url)));
const nodeStreamShim = resolve(rootDir, 'src/shims/node-stream.ts');
const nodeStreamWebShim = resolve(rootDir, 'src/shims/node-stream-web.ts');
const nodeAsyncHooksShim = resolve(rootDir, 'src/shims/node-async-hooks.ts');

const config = defineConfig(env => {
  const ssrBuild = (env as {ssrBuild?: boolean}).ssrBuild === true;

  return {
    server: {
      port: 4040,
    },
    resolve: ssrBuild
      ? undefined
      : {
          alias: {
            'node:stream': nodeStreamShim,
            'node:stream/web': nodeStreamWebShim,
            'node:async_hooks': nodeAsyncHooksShim,
          },
        },
    plugins: [
      nitro({preset: 'vercel', vercel: {entryFormat: 'node'}}),
      // this is the plugin that enables path aliases
      viteTsConfigPaths({
        projects: ['./tsconfig.json'],
      }),
      tailwindcss(),
      tanstackStart(),
      viteReact(),
    ],
  };
});

export default config;
