import esbuild from 'esbuild';
import path from 'path';
import { globby } from 'globby';
import { WEB_WORKER } from './plugins/worker';

/**
 * @type {import('esbuild').BuildOptions}
 */
const ESBUILD_OPTS = {
    target: ["es2018"],
    platform: "browser",
    outdir: "dist",

    mainFields: ['esbuild', 'browser', 'module', 'main'],

    assetNames: "[name]",
    entryNames: '[name].min',

    bundle: true,
    minify: true,
    color: true,
    format: "esm",
    sourcemap: true,
    splitting: true,
    keepNames: true,

    loader: {
        '.ttf': 'file',
        '.wasm': 'file'
    },

    inject: ["./scripts/shims/node.js"],

    plugins: [
        WEB_WORKER(),
    ]
}

async function build() {
    const entryPoints = await globby([
        `src/editor/*.ts`,
        `src/@astro/*.ts`,
        `!src/editor/**/*.d.ts`
    ], { absolute: true })

    entryPoints.push(path.resolve(`node_modules/esbuild-wasm/esbuild.wasm`));
    const result = await esbuild.build({ 
        ...ESBUILD_OPTS,
        entryPoints
    });

    await esbuild.build({ 
        ...ESBUILD_OPTS,
        entryPoints: [
            "src/@astro/internal/index.ts"
        ],
        outdir: undefined,
        splitting: false,
        outfile: "dist/@astro/internal.js",
    });

    // for (const err of result.errors) {
    //     console.error(err);
    // }

    // for (const warn of result.warnings) {
    //     console.warn(warn);
    // }
}


// Run the build
build();
