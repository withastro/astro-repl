import type { Plugin } from 'esbuild';
import { VIRTUAL_FS_NAMESPACE } from './virtual-fs';

export const ALIAS_NAMESPACE = "alias-import"
export const ALIAS = (): Plugin => {
    return {
        name: ALIAS_NAMESPACE,
        setup(build) {
            build.onResolve({ filter: /\@\/.*/ }, (args) => {
                return {
                    path: args.path.replace(/^\@\//, '/src/components/'),
                    pluginData: args.pluginData,
                    namespace: VIRTUAL_FS_NAMESPACE
                };
            });
        },
    };
};
