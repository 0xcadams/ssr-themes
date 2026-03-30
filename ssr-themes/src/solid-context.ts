import {createContext} from 'solid-js';
import type {ThemeContextValue} from './solid-types';

export const ThemeContext = createContext<
  ThemeContextValue | undefined
>(undefined);
