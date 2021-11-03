// Based on https://github.com/okikio/bundle/blob/main/src/ts/util/WebWorker.ts
import { EventEmitter } from '@okikio/emitter';
import { SharedWorkerPolyfill as WebWorker } from '@okikio/sharedworker';

import { ModuleWorkerSupported } from "./index";

import BUILD_WORKER_URL from 'worker:../editor/workers/build.ts';
export const WorkerEvents = new EventEmitter(); // WebWorker
const BuildWorkerOptions = { 
    name: 'build-worker',
    type: ModuleWorkerSupported ? "module"  : "classic" 
 } as WorkerOptions;

export const BuildWorker = new Worker(BUILD_WORKER_URL, BuildWorkerOptions);

// BuildWorker.start();

export { WebWorker };
export default WebWorker;