import {readFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {transform} from 'esbuild';
import type {Plugin} from 'vite';

const scriptPath = resolve(
  import.meta.dirname,
  'src/script.ts',
);
const themeScriptPath = resolve(
  import.meta.dirname,
  'src/theme-script.ts',
);
const inlineScriptPlaceholder =
  '__INLINE_THEME_SCRIPT__';

type TransformResult = {
  code: string;
};

let inlineScriptSourcePromise:
  | Promise<string>
  | undefined;

const loadInlineScriptSource = async () => {
  const result = (await transform(
    await readFile(scriptPath, 'utf8'),
    {
      loader: 'ts',
      minify: true,
      sourcefile: scriptPath,
      target: 'es2018',
    },
  )) as TransformResult;
  const output = result.code.trim();
  const prefix = 'export default';

  if (!output.startsWith(prefix)) {
    throw new Error(
      'Failed to extract the inline theme script.',
    );
  }

  return output
    .slice(prefix.length)
    .trim()
    .replace(/;$/, '');
};

const getInlineScriptSource = () => {
  if (!inlineScriptSourcePromise) {
    inlineScriptSourcePromise =
      loadInlineScriptSource().catch(error => {
        inlineScriptSourcePromise = undefined;
        throw error;
      });
  }

  return inlineScriptSourcePromise;
};

export const inlineScriptPlugin = (): Plugin => ({
  name: 'ssr-themes-inline-script',
  async transform(code, id) {
    if (id.split('?', 1)[0] !== themeScriptPath) {
      return null;
    }

    if (!code.includes(inlineScriptPlaceholder)) {
      throw new Error(
        'Failed to find the inline theme script placeholder.',
      );
    }

    return code.replace(
      /['"]__INLINE_THEME_SCRIPT__['"]/,
      JSON.stringify(await getInlineScriptSource()),
    );
  },
});
