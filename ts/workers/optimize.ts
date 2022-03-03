import {
    scanImports,
    flattenId,
    createMissingImporterRegisterFn
} from 'browser-vite/dist/browser';
  
import type {
    ResolvedConfig,
    DepOptimizationMetadata,
    ViteDevServer
} from "browser-vite/dist/node";

  export async function runOptimize(server: ViteDevServer) {
    const optimizeConfig = {
      ...server.config,
      build: {
        ...server.config.build,
        rollupOptions: {
          ...server.config.build.rollupOptions,
          input: ENTRY_FILES,
        },
      },
    };
  
    try {
      server._isRunningOptimizer = true;
      server._optimizeDepsMetadata = null;
      server._optimizeDepsMetadata = await optimizeDeps(
        server,
        optimizeConfig,
      );
    } finally {
      server._isRunningOptimizer = false;
    }
    server._registerMissingImport = createMissingImporterRegisterFn(
      server,
      (_config, _force, _asCommand, newDeps) =>
        optimizeDeps(server, optimizeConfig, newDeps)
    );
  }
  
  async function optimizeDeps(
    server: ViteDevServer,
    config: ResolvedConfig,
    deps?: Record<string, string>
  ): Promise<DepOptimizationMetadata> {
    const mainHash = '0';
    const data: StudioDepOptimizationMetadata = {
      hash: mainHash,
      browserHash: mainHash,
      optimized: {},
    };
  
    if (deps) {
      console.log('New dependencies: ', Object.keys(deps));
    } else {
      const { missing } = await scanImports(config);
      deps = missing;
      console.log('Scanned dependencies: ', Object.keys(deps));
    }
    // Optimize dependency set using a bundler service, e.g. esm.sh
    return data;
  }