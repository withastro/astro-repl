// Based on https://github.com/okikio/bundle/blob/main/src/ts/plugins/bare.ts
import { CDN_NAMESPACE } from './cdn';
import path from 'path';

import type { Plugin } from 'esbuild';

export const HOST = 'https://cdn.skypack.dev/';
export const BARE = (): Plugin => {
  return {
    name: 'bare',
    setup(build) {
      build.onResolve({ filter: /.*/ }, (args) => {
        if (/^\@\//.test(args.path)) {
          return {
            path: args.path,
            namespace: 'external',
            external: true,
          };
        }

        if (/^(?!\.).*/.test(args.path) && !path.isAbsolute(args.path)) {
          let argPath = args.path.replace(/^(skypack|esm|esm\.sh|unpkg|jsdelivr|esm\.run)\:/, "");
          let host = HOST;
          if (/^skypack\:/.test(args.path)) {
            host = `https://cdn.skypack.dev/`;
          } else if (/^(esm\.sh|esm)\:/.test(args.path)) {
            host = `https://cdn.esm.sh/`;
          } else if (/^unpkg\:/.test(args.path)) {
            host = `https://unpkg.com/`;
          } else if (/^(jsdelivr|esm\.run)\:/.test(args.path)) {
            host = `https://cdn.jsdelivr.net/npm/`;
          }

          // typescript will only work on unpkg
          else if (/^typescript/.test(args.path))
            host = `https://unpkg.com/`;

          let pathUrl = new URL(argPath, host).toString();
          pathUrl = pathUrl.replace(/\/$/, '/index'); // Some packages use "../../" which this is supposed to fix

          let parentFileExt = path.extname(args.pluginData.parentUrl).replace(/^./, '');
          let fileExt = path.extname(pathUrl).replace(/^./, '');

          // if (!fileExt || fileExt === 'js') {
          //   return {
          //     path: pathUrl,
          //     namespace: 'external',
          //     external: true,
          //   };
          // }

          let parentPathIsTS = fileExt == '' && /tsx?|jsx/.test(parentFileExt);
          if (parentPathIsTS) {
            pathUrl += `.` + parentFileExt;
          }
          let pathIsTS = /tsx?|jsx/.test(fileExt);

          let loader = undefined;
          switch (fileExt) {
            case 'ts':
              loader = 'ts';
              break;

            case 'jsx':
            case 'tsx':
              loader = 'tsx';
              break;

            case 'css':
            case 'scss':
              loader = 'css';
              break;

            case 'png':
            case 'jpeg':
            case 'ttf':
              loader = 'file';
              break;

            case 'svg':
            case 'html':
            case 'txt':
              loader = 'text';
              break;
          }

          loader = pathIsTS || parentPathIsTS ? 'ts' : loader;

          return {
            path: pathUrl,
            namespace: CDN_NAMESPACE,
            pluginData: {
              parentUrl: host,
              pathUrl,
              loader,
            },
          };
        }
      });
    },
  };
};
