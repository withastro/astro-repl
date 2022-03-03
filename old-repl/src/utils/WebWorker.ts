// Based on https://github.com/okikio/bundle/blob/main/src/ts/util/WebWorker.ts
import { EventEmitter } from '@okikio/emitter';
import { SharedWorkerPolyfill as WebWorker, SharedWorkerSupported } from '@okikio/sharedworker';

import { ModuleWorkerSupported } from "./index";

import BUILD_WORKER_URL from 'worker:../editor/workers/build.ts';
export const WorkerEvents = new EventEmitter(); 
const BuildWorkerOptions = { 
    name: 'build-worker',
    type: ModuleWorkerSupported ? "module"  : "classic" 
} as WorkerOptions;

console.log(`This browser supports ${ModuleWorkerSupported ? "module" : "classic"} workers!`);
console.log(`This browser ${SharedWorkerSupported ? "supports Shared Web Workers" : "only supports Web Workers"}!`);

export const BuildWorker = new WebWorker(BUILD_WORKER_URL, BuildWorkerOptions); 
BuildWorker?.start?.();

export { WebWorker };
export default WebWorker;