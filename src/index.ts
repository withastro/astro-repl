import './styles/index.css'

import ESBUILD_WORKER_URL from "worker:./editor/workers/esbuild.ts";
import ASTRO_WORKER_URL from "worker:./editor/workers/astro.ts";
import render from './ui';

const esbuildWorker = new Worker(ESBUILD_WORKER_URL, {
    name: "esbuild-worker",
    type: "module"
});

const astroWorker = new Worker(ASTRO_WORKER_URL, {
    name: "astro-worker",
    type: "module"
});

(async () => {
    // Monaco Code Editor
    let Monaco = await import("./editor/modules/monaco");
    render({ Monaco, esbuildWorker, astroWorker });
})()
