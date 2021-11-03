// Based on https://github.com/hardfist/neo-tools/blob/main/packages/bundler/src/plugins/http.ts
import type { Plugin } from 'esbuild';

export const CACHE = new Map();
export async function fetchPkg(url: string) {
    let result: { url: string; content: string; };
    if (CACHE.has(url) && CACHE.size < 100) 
        result = CACHE.get(url);
    else {        
        if (CACHE.size >= 100) CACHE.clear();
        let res = await fetch(url);
        result = {
            url: res.url,
            content: await res.text(),
        };
        CACHE.set(url, result);
    }

    return result;
}

export const HTTP_NAMESPACE = 'http-url';
export const HTTP = (ModuleWorkerSupported: boolean): Plugin => {
    return {
        name: 'http',
        setup(build) {
            // Intercept import paths starting with "http:" and "https:" so
            // esbuild doesn't attempt to map them to a file system location.
            // Tag them with the "http-url" namespace to associate them with
            // this plugin.
            build.onResolve({ filter: /^https?:\/\// }, args => {
                return Object.assign({
                    path: new URL(args.path, args.resolveDir.replace(/^\//, '')).toString(),
                    namespace: ModuleWorkerSupported ? 'external' : HTTP_NAMESPACE,
                    external: ModuleWorkerSupported
                });
            });

            // We also want to intercept all import paths inside downloaded
            // files and resolve them against the original URL. All of these
            // files will be in the "http-url" namespace. Make sure to keep
            // the newly resolved URL in the "http-url" namespace so imports
            // inside it will also be resolved as URLs recursively.
            build.onResolve({ filter: /.*/, namespace: HTTP_NAMESPACE }, args => {
                return {
                    path: new URL(args.path, args.importer).toString(),
                    namespace: ModuleWorkerSupported ? 'external' : HTTP_NAMESPACE,
                    external: ModuleWorkerSupported
                };
            });

            // When a URL is loaded, we want to actually download the content
            // from the internet. This has just enough logic to be able to
            // handle the example import from https://cdn.esm.sh/ but in reality this
            // would probably need to be more complex.
            build.onLoad({ filter: /.*/, namespace: HTTP_NAMESPACE }, async (args) => {
                const { content, url } = await fetchPkg(args.path);
                return {
                    contents: content,
                    loader: 'ts',
                    resolveDir: `/${url}`, // a hack fix resolveDir problem
                };
            });
        },
    };
};