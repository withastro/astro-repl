// Based on https://github.com/okikio/bundle/blob/main/src/ts/util/WebWorker.ts
import { EventEmitter } from '@okikio/emitter';
import { SharedWorkerPolyfill as WebWorker } from '@okikio/sharedworker';

import BUILD_WORKER_URL from 'worker:../editor/workers/build.ts';
export const WorkerEvents = new EventEmitter(); // WebWorker
export const BuildWorker = new WebWorker(BUILD_WORKER_URL, {
    name: 'build-worker',
    // type: "module"
});

// BuildWorker.start();
  
export { WebWorker };
export default WebWorker;