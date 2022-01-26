// Based on https://github.com/okikio/bundle/blob/main/src/ts/plugins/virtual-fs.ts
import type { transform as TypeAstroTransform } from '@astrojs/compiler';
import type { Plugin } from 'esbuild';

import { encode, decode } from "../../utils/encode-decode";
import { inferLoader, extname } from '../../utils/loader';

import { CDN_NAMESPACE } from "./cdn";
import { EXTERNALS_NAMESPACE } from './external';

export const VIRTUAL_FS_NAMESPACE = 'virtualfs';
type fileMetadata = {
    filename: string;
    transform: typeof TypeAstroTransform;
    getResolvedPath: (path: string, importer?: string) => string;
    getFile: (path: string, type?: 'string' | 'buffer', importer?: string) => string | Uint8Array;
};

export const VIRTUAL_FS = ({ filename, transform, getResolvedPath, getFile }: fileMetadata, ModuleWorkerSupported: boolean): Plugin => {
    return {
        name: VIRTUAL_FS_NAMESPACE,
        setup(build) {
            build.onResolve({ filter: /.*/, namespace: VIRTUAL_FS_NAMESPACE }, (args) => {
                if (args.path.startsWith('/play/@astro/')) {
                    let pathUrl = new URL(args.path, globalThis.location.origin).toString();
                    return {
                        path: pathUrl,
                        pluginData: ModuleWorkerSupported ? {} : { ...args.pluginData, loader: 'ts', pathUrl },
                        namespace: ModuleWorkerSupported ? EXTERNALS_NAMESPACE : CDN_NAMESPACE,
                        external: ModuleWorkerSupported
                    }
                }

                return {
                    path: args.path,
                    pluginData: args.pluginData,
                    namespace: VIRTUAL_FS_NAMESPACE
                };
            });

            build.onLoad({ filter: /.*/, namespace: VIRTUAL_FS_NAMESPACE }, async (args) => {
                let realPath = args.path;
                if (realPath.startsWith('@/'))
                    realPath = args.path.replace(/^\@\//, '/src/components/');

                let resolvedPath = getResolvedPath(realPath, args.pluginData.importer);
                let content = getFile(realPath) as Uint8Array;
                if (extname(realPath) === '.astro') {
                    let tsContent = '';

                    try {
                        tsContent = await transform(decode(content), {
                            internalURL: '/play/@astro/internal.min.js',
                            sourcemap: false,
                            sourcefile: filename,
                            pathname: filename
                        }).then(res => res.code);
                    } catch (e) {
                        throw `Astro transform error - "${resolvedPath}" couldn't be transformed by the Astro compiler`;
                    }

                    return {
                        contents: encode(tsContent),
                        pluginData: {
                            importer: resolvedPath,
                        },
                        loader: 'ts'
                    };
                }

                return {
                    contents: content,
                    pluginData: {
                        importer: resolvedPath,
                    },
                    loader: inferLoader(resolvedPath)
                };
            });
        },
    };
};
