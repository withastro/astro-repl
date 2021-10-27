import { initialize as EsbuildInitialize, build } from "esbuild-wasm/esm/browser";
import { EventEmitter } from "@okikio/emitter";

import { getHighlighter, setCDN } from 'shiki';
import { transform, initialize as AstroInitialize } from '@astrojs/compiler';

import path from "path";
import { fs, vol } from "memfs";

// @ts-ignore
import prettier from 'prettier/esm/standalone.mjs';

// @ts-ignore
import parserHtml from 'prettier/esm/parser-html.mjs';

// @ts-ignore
import parserCss from 'prettier/esm/parser-postcss.mjs';

// @ts-ignore
import parserBabel from 'prettier/esm/parser-babel.mjs';

import { ALIAS } from "../plugins/alias";
import { EXTERNAL } from "../plugins/external";
import { ENTRY } from "../plugins/entry";
import { JSON_PLUGIN } from "../plugins/json";
import { BARE } from "../plugins/bare";
import { HTTP } from "../plugins/http";
import { CDN } from "../plugins/cdn";
import { VIRTUAL_FS } from "../plugins/virtual-fs";
import { WASM } from "../plugins/wasm";

import { renderAstroToHTML } from "../../utils/astro";
import { debounce } from "../../utils";

import type { Highlighter } from 'shiki';

interface TimingObject {
    init?: number;
    compile?: number;
    format?: number;
    highlight?: number;
    total?: number;
    __current: number;
}

function timestamp(timing: TimingObject, tag: keyof TimingObject) {
    timing[tag as any] = performance.now() - timing.__current;
    timing.__current = performance.now();
}

function createTimestamp(): TimingObject {
    return { __current: performance.now() };
}

let highlighter: Highlighter;
let _initialized = false;

const initEvent = new EventEmitter();

(async () => {
    try {
        if (!_initialized) {
            await EsbuildInitialize({
                worker: false,
                wasmURL: `/play/esbuild.wasm`
            });

            await AstroInitialize({
                wasmURL: '/play/astro.wasm'
            });

            setCDN('https://unpkg.com/shiki/');
            highlighter = await getHighlighter({ theme: 'github-dark', langs: ['html', 'ts'] });

            _initialized = true;    
            initEvent.emit("init");    
        }
    } catch (error) { 
        initEvent.emit("error", error);    
    }
})();

const start = (port) => {
    const BuildEvents = new EventEmitter();
    vol.fromJSON({}, `/`);
    
    initEvent.on({
        // When the SharedWorker first loads, tell the page that esbuild has initialized  
        init() {
            port.postMessage({
                event: "init",
                details: JSON.stringify({})
            });
        },
        error(err) {         
            port.postMessage({
                event: "error",
                details: JSON.stringify({
                    type: `Error initializing, you may need to close and reopen all currently open pages pages`,
                    error: err,
                })
            });
        }
    });

    // If another page loads while SharedWorker is still active, tell that page that esbuild is initialized
    if (_initialized) 
        initEvent.emit("init"); 

    BuildEvents.on("build", (details) => {//debounce((details) => {
        if (!_initialized) {
            port.postMessage({
                event: "warn",
                details: JSON.stringify({
                    type: `Build worker not initialized`,
                    message: `You need to wait for a little bit before trying to build astro files`
                })
            });

            return;
        }

        let { models = [], current } = JSON.parse(details) ?? {};
        let files = [];
        let html, js, shiki;

        if (models.length <= 0 && current) models = [current];
        (async () => {
            try {
                /* Esbuild */
                for (let data of models) {
                    let filename: string = `${data.filename}`;
                    let outfile = `/dist/${filename.slice('/src/pages/'.length)}`;
                    let input: string = `${data.value}`.trim(); // Ensure input is a string

                    fs.mkdirpSync(path.dirname(filename));
                    fs.writeFileSync(filename, input);

                    if (input.length <= 0) continue;

                    let content: string = "";
                    let result = await build({
                        entryPoints: ['<stdin>'],
                        bundle: true,
                        minify: true,
                        color: true,
                        sourcemap: 'inline',
                        treeShaking: true,
                        incremental: true,
                        target: ["esnext"],
                        logLevel: 'silent',
                        write: false,
                        outfile,
                        platform: "browser",
                        // format: "esm",
                        format: "iife",
                        loader: {
                            '.png': 'file',
                            '.jpeg': 'file',
                            '.ttf': 'file',
                            '.svg': 'text',
                            '.html': 'text',
                            '.scss': 'css'
                        },
                        define: {
                            "__NODE__": `false`,
                            "process.env.NODE_ENV": `"production"`
                        },
                        plugins: [
                            ALIAS(),
                            EXTERNAL(),
                            ENTRY(filename),
                            JSON_PLUGIN(),

                            BARE(),
                            HTTP(),
                            CDN(),
                            VIRTUAL_FS({ filename, transform }),
                            WASM(),
                        ],
                        globalName: 'bundler',
                    });
                    
                    result?.outputFiles?.forEach((x) => {
                        if (!fs.existsSync(path.dirname(x.path))) {
                            fs.mkdirSync(path.dirname(x.path));
                        }

                        fs.writeFileSync(x.path, x.text);
                    });

                    if (result?.errors.length > 0)
                        throw result.errors[0];

                    content = await fs.promises.readFile(outfile, "utf-8") as string;
                    content = content?.trim?.(); // Remove unesscary space
                    // console.log(content)
                    const output = await renderAstroToHTML(content);
                    if (typeof output === 'string')
                        content = output;
                    else
                        throw output.errors[0];

                    if (current?.filename == filename) {
                        html = { content, input };
                    }

                    files.push({
                        input, content
                    });
                }

                /* Astro */
                if (current) {
                    let timing = createTimestamp();
                    timestamp(timing, 'init');

                    let filename: string = `${current.filename}`;
                    let input: string = `${current.value}`;

                    try {
                        let content = await transform(input, {
                            sourcefile: filename,
                            internalURL: 'astro/internal',
                            sourcemap: false
                        }).then(res => res.code);
                        timestamp(timing, 'compile');

                        content = prettier.format(content, {
                            parser: 'babel',
                            plugins: [parserBabel]
                        });
                        timestamp(timing, 'format');

                        content = highlighter.codeToHtml(content, 'ts');
                        timestamp(timing, 'highlight');

                        timestamp(timing, 'total');
                        js = { input, content, timing };
                    } catch (e) {
                        throw { type: "astro", error: e };
                    }
                }

                /* Shikijs */
                if (current && html) {
                    let timing = createTimestamp();
                    timestamp(timing, 'init');

                    let filename: string = `${current.filename}`;
                    let input: string = `${current.value}`;

                    try {
                        let content = prettier.format(html?.content, {
                            parser: 'html',
                            plugins: [parserHtml, parserCss, parserBabel]
                        });
                        timestamp(timing, 'format');

                        content = highlighter.codeToHtml(content, 'html');
                        timestamp(timing, 'highlight');

                        timestamp(timing, 'total');
                        shiki = { input, content, timing };
                    } catch (e) {
                        throw { type: "shiki", error: e };
                    }
                }

                port.postMessage({
                    event: "result",
                    details: JSON.stringify({
                        type: `Build complete`,
                        values: files,
                        js, html, shiki
                    })
                });
            } catch (error) {
                // @ts-ignore
                let err = "error" in error ? error.error : error;
                port.postMessage({
                    event: "error",
                    details: JSON.stringify({
                        type: `${error?.type ?? "Build"} error`,
                        error: err
                    })
                });

                console.warn(err);

                return;
            }
        })();
    }//, 80)
    );

    port.onmessage = ({ data }) => {
        BuildEvents.emit(data.event, data.details);
    };
}

// @ts-ignore
self.onconnect = (e) => {
    let [port] = e.ports;
    start(port);
}

if (!("SharedWorkerGlobalScope" in self)) {
    start(self);
}