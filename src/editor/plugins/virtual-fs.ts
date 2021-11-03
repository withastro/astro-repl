// Based on https://github.com/okikio/bundle/blob/main/src/ts/plugins/virtual-fs.ts
import path from 'path';
import { fs } from "memfs";

import type { transform as TypeAstroTransform } from '@astrojs/compiler';
import type { Plugin } from 'esbuild';

export const VIRTUAL_FS_NAMESPACE = 'virtualfs';
export const resolve = ({ id, importer }: { id: string; importer: string }) => {
    let resolvedPath = id;
    if (importer && id.startsWith('.'))
        resolvedPath = path.resolve(path.dirname(importer), id);
    if (fs.existsSync(resolvedPath)) return resolvedPath;

    throw new Error(`${resolvedPath} does not exist`);
};

import { CDN_NAMESPACE } from "./cdn";
export const VIRTUAL_FS = ({ filename, transform }: { filename: string, transform: typeof TypeAstroTransform }, ModuleWorkerSupported: boolean): Plugin => {
    return {
        name: VIRTUAL_FS_NAMESPACE,
        setup(build) {
            build.onResolve({ filter: /.*/, namespace: VIRTUAL_FS_NAMESPACE }, (args) => {
                if (args.path.startsWith('/play/@astro/')) {
                    let pathUrl = new URL(args.path, self.location.origin).toString();
                    return {
                        path: pathUrl,
                        pluginData: ModuleWorkerSupported ? {} : { ...args.pluginData, loader: 'ts', pathUrl: pathUrl },
                        namespace: ModuleWorkerSupported ? 'external' : CDN_NAMESPACE,
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
                if (realPath.startsWith('@/')) {
                    realPath = args.path.replace(/^\@\//, '/src/components/');
                }
                const resolvePath = resolve({
                    id: realPath,
                    importer: args.pluginData.importer
                });
                
                if (!resolvePath) throw new Error('not found');
                realPath = resolvePath;

                const content = (await fs.promises.readFile(realPath)).toString();

                if (path.extname(realPath) === '.astro') {
                    let tsContent = '';

                    try {
                        tsContent = await transform(content, { internalURL: '/play/@astro/internal.min.js', sourcemap: false, sourcefile: '/#' + filename }).then(res => res.code);
                    } catch (e) {
                        console.log('virtualfs astro transform error', e);
                    }
                    return {
                        contents: tsContent,
                        pluginData: {
                            importer: realPath,
                        },
                        loader: 'ts'
                    };
                }
                
                return {
                    contents: content,
                    pluginData: {
                        importer: realPath,
                    },
                    loader: path.extname(realPath).slice(1) as 'ts',
                };
            });
        },
    };
};
