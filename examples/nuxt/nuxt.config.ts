import tailwindcss from '@tailwindcss/vite';
import {defineNuxtConfig} from 'nuxt/config';

export default defineNuxtConfig({
  compatibilityDate: '2026-03-30',
  css: ['~/app.css'],
  devtools: {enabled: false},
  vite: {
    plugins: [tailwindcss()],
  },
});
