// Based on https://github.com/okikio/bundle/blob/main/src/ts/plugins/cdn.ts
import type { Plugin } from 'esbuild';

import { fetchPkg } from './http';
import { EXTERNALS_NAMESPACE } from './external';
import { inferLoader, isBareImport, getCDNHost, extname } from '../../utils/loader';

export const CDN_NAMESPACE = 'cdn-url';
export const CDN = (ModuleWorkerSupported: boolean): Plugin => {
  return {
    name: CDN_NAMESPACE,
    setup(build) {
      // Resolve bare imports to the CDN required using different URL schemes
      build.onResolve({ filter: /.*/ }, (args) => {
        if (/^\@\//.test(args.path)) {
          return {
            namespace: EXTERNALS_NAMESPACE,
            path: args.path,
            external: true
          };
        }

        if (isBareImport(args.path)) {
          let { host, argPath } = getCDNHost(args.path);
          
          if (ModuleWorkerSupported && /js|ts/.test(inferLoader(argPath)) && !/\.c(js|ts)/.test(extname(argPath))) {
            return {
              namespace: EXTERNALS_NAMESPACE,
              path: new URL(argPath, host).href,
              external: true,
              pluginData: {
                parentUrl: host,
              },
            };
          }

          return {
            namespace: CDN_NAMESPACE,
            path: argPath,
            pluginData: {
              parentUrl: host,
            },
          };
        }
      });

      // Pass on the info from the bare import
      build.onResolve({ namespace: CDN_NAMESPACE, filter: /.*/ }, async (args) => {
        return {
          path: args.path,
          namespace: CDN_NAMESPACE,
          pluginData: args.pluginData,
        };
      });

      // On load 
      build.onLoad({ namespace: CDN_NAMESPACE, filter: /.*/ }, async (args) => {
        let pathUrl = new URL(args.path, args.pluginData.parentUrl).toString();
        pathUrl = pathUrl.replace(/\/$/, "/index"); // Some packages use "../../" which this is supposed to fix

        const { content, url } = await fetchPkg(pathUrl);
        return Object.assign({
          contents: content,
          pluginData: {
            parentUrl: url,
          },
          loader: inferLoader(pathUrl)
        });
      });
    },
  };
};
