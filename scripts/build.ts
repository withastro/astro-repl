import * as Esbuild from 'esbuild';
import path from 'path';
import fastGlob from 'fast-glob';
import { WEB_WORKER } from './plugins/worker';
import { rm, mkdir, copyFile } from 'fs/promises';

const ESBUILD_OPTS: Esbuild.BuildOptions = {
  target: ['es2018'],
  platform: 'browser',
  outdir: 'dist/play',

  mainFields: ['esbuild', 'browser', 'module', 'main'],

  assetNames: '[name]',
  entryNames: '[name].min',

  bundle: true,
  minify: true,
  color: true,
  format: 'esm',
  sourcemap: true,
  splitting: true,
  keepNames: true,

  loader: {
    '.ttf': 'file',
    '.wasm': 'file',
  },

  plugins: [WEB_WORKER()],
};

async function build() {
  const isWatch = !!process.argv.find((arg) => arg === '--watch');
  try {
    await rm('dist', { recursive: true });
  } catch (e) {}
  try {
    await mkdir('dist/play', { recursive: true });
  } catch (e) {}
  try {
    const pub = await fastGlob('public/**/*');
    const wasm = ['node_modules/esbuild-wasm/esbuild.wasm', 'node_modules/@astrojs/compiler/astro.wasm'];
    await Promise.all(
      wasm.map((src) => {
        const dest = `dist/play/${path.basename(src)}`;
        return copyFile(src, dest);
      })
    );
    await Promise.all(
      pub.map(async (src) => {
        const dest = src.replace(/^public/, path.join('dist', 'play'));
        await mkdir(path.dirname(dest), { recursive: true });
        return copyFile(src, dest);
      })
    );
  } catch (e) {}
  const entryPoints = await fastGlob([`src/index.ts`, `src/editor/*.ts`, `src/@astro/*.ts`, `!src/editor/**/*.d.ts`], { absolute: true });

  entryPoints.push(path.resolve(`node_modules/esbuild-wasm/esbuild.wasm`));
  await Esbuild.build({
    ...ESBUILD_OPTS,
    entryPoints,
    watch: isWatch,
  });

  await Esbuild.build({
    ...ESBUILD_OPTS,
    entryPoints: ['src/@astro/internal/index.ts'],
    outdir: undefined,
    splitting: false,
    outfile: 'dist/play/@astro/internal.js',
  });
}

// Run the build
build();

