import {z} from 'zod';

export const lightOrDarkSchema = z.enum([
  'dark',
  'light',
]);

export const lightOrDarkWithSystemSchema = z.enum([
  'dark',
  'light',
  'system',
]);
