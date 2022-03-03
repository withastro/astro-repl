import { CLIENT_ENTRY, CLIENT_DIR, ENV_ENTRY } from 'browser-vite/dist/node/constants';
import { Plugin } from 'browser-vite';

// @ts-ignore
import vite_client from 'browser-vite/dist/client/browser.mjs?raw';

// @ts-ignore
import vite_client_env from 'browser-vite/dist/client/env.mjs?raw';

const viteClientPlugin: Plugin = {
  name: 'vite:browser:hmr',
  enforce: 'pre',
  resolveId(id) {
    if (id.startsWith(CLIENT_DIR)) {
      return {
        id: /\.mjs$/.test(id) ? id : `${id}.mjs`,
        external: true,
      };
    }
  },
  load(id) {
    if (id === CLIENT_ENTRY) {
      return vite_client;
    }
    if (id === ENV_ENTRY) {
      return vite_client_env;
    }
  },
};

export { viteClientPlugin };