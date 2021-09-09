import type { editor as Editor } from "monaco-editor";
import ESBUILD_WORKER_URL from "worker:./workers/esbuild.ts";
import { renderPage } from '../@astro/internal/index.ts';
import '../styles/index.css'

const frame = document.querySelector(`#frame`) as HTMLIFrameElement;

// @ts-ignore
const BundleWorker = new Worker(ESBUILD_WORKER_URL, {
    name: "esbuild-worker",
    type: "module"
});
   
let cache = new Map();
let count = 0; 
let value = "";
let start = Date.now();
BundleWorker.onmessage = async ({ data }) => {
    if (data.warn) {
        console.warn(data.warn + " \n");
        return;
    }

    if (data.ready) {
        // fileSizeEl.textContent = `...`;
        return;
    }

    if (data.error) {
        console.error(data.type + " (please create a new issue in the repo)\n", data.error);
        // fileSizeEl.textContent = `Error`;
        return;
    }

    let { content } = data.value;
    if (count > 10) {
        console.clear();
        count = 0;
    }

    console.groupCollapsed("Input Code: ");
    console.log(value);
    console.groupEnd();
    console.groupCollapsed("Bundled Code: ");
    console.log(content);
    console.groupEnd();
    console.groupEnd();
    count++;

    const html = await renderToHTML(content);
    const template = document.createElement('template');
    template.innerHTML = html;
    
    cache.set(value, html);
    frame.contentWindow.document.open();
    frame.contentWindow.document.write(html);
    frame.contentWindow.document.close();
};

async function renderToHTML(content: string) {
    const url = `data:application/javascript;base64,${Buffer.from(content).toString('base64')}`;

    const { default: mod } = await import(url);
    const html = await renderPage({
        styles: new Set(),
        scripts: new Set(),
        /** This function returns the `Astro` faux-global */
        createAstro(props: any) {
            // const site = location;
            const url = new URL('http://localhost:3000/')
            // const canonicalURL = getCanonicalURL(pathname, astroConfig.buildOptions.site || origin)
            return { isPage: true, site: url, request: { url, canonicalURL: url }, props };
        },
    }, await mod, {}, null);
    return html;
}

let editor: Editor.IStandaloneCodeEditor;

(async () => {
    // Monaco Code Editor
    let Monaco = await import("./modules/monaco");
    editor = Monaco.build();
    editor.onDidChangeModelContent(Monaco.debounce(async () => {
        const model = editor.getModel();
        value = model.getValue().trim();
        if (cache.has(value)) {
            frame.contentWindow.document.open();
            frame.contentWindow.document.write(cache.get(value));
            frame.contentWindow.document.close();
        } else {
            BundleWorker.postMessage(JSON.stringify({ filename: model.uri.path, value }))
        }
    }))
})()
