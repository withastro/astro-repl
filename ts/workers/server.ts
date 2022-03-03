import {
    transformWithEsbuild,
    ModuleGraph,
    transformRequest,
    createPluginContainer,
    createDevHtmlTransformFn,
    resolveConfig,
    generateCodeFrame,
    ssrTransform,
} from 'browser-vite/dist/browser';
import type {
    ViteDevServer,
    PluginOption,
    ssrLoadModule
} from 'browser-vite/dist/node';
  
import { viteClientPlugin } from "./client";
import { runOptimize } from './optimize';
import { nodeResolvePlugin } from './resolve';
  
  export async function createServer() {
    const config = await resolveConfig(
      {
        plugins: [
          // virtual plugin to provide vite client/env special entries (see below)
          viteClientPlugin,
          // virtual plugin to resolve NPM dependencies, e.g. using unpkg, skypack or another provider (browser-vite only handles project files)
          nodeResolvePlugin,
          // add vite plugins you need here (e.g. vue, react, astro ...)
        ]
        base: BASE_URL, // as hooked in service worker
        // not really used, but needs to be defined to enable dep optimizations
        cacheDir: 'browser',
        root: VFS_ROOT,
        // any other configuration (e.g. resolve alias)
      },
      'serve'
    );
    const plugins = config.plugins;
    const pluginContainer = await createPluginContainer(config);
    const moduleGraph = new ModuleGraph((url) => pluginContainer.resolveId(url));
  
    const watcher: any = {
      on(what: string, cb: any) {
        return watcher;
      },
      add() {},
    };
    const server: ViteDevServer = {
      config,
      pluginContainer,
      moduleGraph,
      transformWithEsbuild,
      transformRequest(url, options) {
        return transformRequest(url, server, options);
      },
      ssrTransform,
      printUrls() {},
      _globImporters: {},
      ws: {
        send(data) {
          // send HMR data to vite client in iframe however you want (post/broadcast-channel ...)
        },
        async close() {},
        on() {},
        off() {},
      },
      watcher,
      async ssrLoadModule(url) {
        return ssrLoadModule(url, server, loadModule);
      },
      ssrFixStacktrace() {},
      async close() {},
      async restart() {},
      _optimizeDepsMetadata: null,
      _isRunningOptimizer: false,
      _ssrExternals: [],
      _restartPromise: null,
      _forceOptimizeOnRestart: false,
      _pendingRequests: new Map(),
    };
  
    server.transformIndexHtml = createDevHtmlTransformFn(server);
  
    // apply server configuration hooks from plugins
    const postHooks: ((() => void) | void)[] = [];
    for (const plugin of plugins) {
      if (plugin.configureServer) {
        postHooks.push(await plugin.configureServer(server));
      }
    }
  
    // run post config hooks
    // This is applied before the html middleware so that user middleware can
    // serve custom content instead of index.html.
    postHooks.forEach((fn) => fn && fn());
  
    await pluginContainer.buildStart({});
    await runOptimize(server);
  
    return server;
  }