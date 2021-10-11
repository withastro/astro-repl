import './styles/index.css';
// import ESBUILD_WORKER_URL from 'worker:./editor/workers/esbuild.ts';
// import ASTRO_WORKER_URL from 'worker:./editor/workers/astro.ts';
// import HTML_WORKER_URL from 'worker:./editor/workers/html.ts';

import { WebWorker } from "./utils/WebWorker";
import { b64Decode } from './utils/b64';
import render from './ui';

// const esbuildWorker = new Worker(ESBUILD_WORKER_URL, {
//   name: 'esbuild-worker',
//   type: 'module',
// });

// const astroWorker = new Worker(ASTRO_WORKER_URL, {
//   name: 'astro-worker',
//   type: 'module',
// });

// const htmlWorker = new Worker(HTML_WORKER_URL, {
//   name: 'html-worker',
//   type: 'module',
// });

(async () => {
  // Monaco Code Editor
  let Monaco = await import('./editor/modules/monaco');
  const hash = window.location.hash;
  let initialModels = {};
  if (hash) {
    try {
      initialModels = b64Decode(hash.slice(1));
    } catch (err) {
      console.error(`Could not load share URL`);
    }
  }
  render({ Monaco, /* esbuildWorker, astroWorker, htmlWorker, */ initialModels });
})();
