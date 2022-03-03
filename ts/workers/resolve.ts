import { Plugin } from 'browser-vite';
import { getCDNHost, isBareImport } from '../utils/loader';

export const HOST = "https://cdn.skypack.dev";
const nodeResolvePlugin: Plugin = {
  name: 'vite:browser:hmr',
  enforce: 'pre',
  resolveId(id) {
    if (isBareImport(id)) {
      return {
        id: getCDNHost(id, HOST).argPath,
        external: true,
      };
    }
  },
};

export { nodeResolvePlugin };