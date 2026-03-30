import react from '@astrojs/react';
import vercel from '@astrojs/vercel';
import {defineConfig} from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

const tailwindPlugin = tailwindcss() as never;

export default defineConfig({
  adapter: vercel(),
  integrations: [react()],
  output: 'server',
  vite: {
    plugins: [tailwindPlugin],
  },
});
