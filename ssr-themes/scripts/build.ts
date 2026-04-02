import {spawn} from 'node:child_process';
import {rm} from 'node:fs/promises';
import {dirname, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';

const packageRoot = resolve(
  dirname(fileURLToPath(import.meta.url)),
  '..',
);
const bunPath = process.execPath;
const cjsEntries = [
  'index',
  'react',
  'solid',
  'vue',
] as const;
const generatedDeclarationFiles = [
  'src/theme-dom.d.ts',
  'src/theme-dom.d.ts.map',
  'src/theme-cookie.d.ts',
  'src/theme-cookie.d.ts.map',
  'src/theme-runtime.d.ts',
  'src/theme-runtime.d.ts.map',
  'src/theme-controller.d.ts',
  'src/theme-controller.d.ts.map',
  'src/types.d.ts',
  'src/types.d.ts.map',
];

const run = async (
  args: readonly string[],
  env?: NodeJS.ProcessEnv,
) => {
  await new Promise<void>((resolvePromise, reject) => {
    const child = spawn(bunPath, args, {
      cwd: packageRoot,
      env: {
        ...process.env,
        ...env,
      },
      stdio: 'inherit',
    });

    child.on('error', reject);
    child.on('exit', code => {
      if (code === 0) {
        resolvePromise();
        return;
      }

      reject(
        new Error(
          `Command failed: bun ${args.join(' ')}`,
        ),
      );
    });
  });
};

const removeGeneratedDeclarations = async () => {
  await Promise.all(
    generatedDeclarationFiles.map(filePath =>
      rm(resolve(packageRoot, filePath), {
        force: true,
      }),
    ),
  );
};

const buildVite = async (
  format: 'cjs' | 'es',
  entry?: (typeof cjsEntries)[number],
) => {
  await run(['x', 'vite', 'build'], {
    SSR_THEMES_FORMAT: format,
    ...(entry ? {SSR_THEMES_ENTRY: entry} : {}),
  });
};

const main = async () => {
  await run(['x', 'svelte-kit', 'sync']);
  await rm(resolve(packageRoot, 'dist'), {
    force: true,
    recursive: true,
  });

  try {
    await buildVite('es');

    for (const entry of cjsEntries) {
      await buildVite('cjs', entry);
    }

    await run([
      'x',
      'svelte-package',
      '-i',
      'src/svelte',
      '-o',
      'dist/svelte',
    ]);
  } finally {
    await removeGeneratedDeclarations();
  }
};

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
