import { initialize as EsbuildInitialize, build, BuildResult, OutputFile, BuildIncremental } from "esbuild-wasm/esm/browser";
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

const WorkerEvents = new EventEmitter();

let highlighter: Highlighter;
let _initialized = false;

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
            WorkerEvents.emit("init", {
                event: "init",
                details: {},
            });
        }
    } catch (error) {
        WorkerEvents.emit("init", {
            event: "error",
            details: {
                type: `initialize error`,
                error,
            }
        })
    }
})();

vol.fromJSON({}, "/");

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
const start = (port) => {
    // When the SharedWorker first loads, tell the page that esbuild has initialized
    WorkerEvents.on("init", (data) => {
        port.postMessage(data);
    });

    // If another page loads while SharedWorker is still active, tell that page that esbuild is initialized
    if (_initialized) {
        port.postMessage({
            event: "init",
            details: {}
        });
    }

    WorkerEvents.on("build", debounce((details) => {
        if (!_initialized) {
            port.postMessage({
                event: "warn",
                details: {
                    type: `not initialized`,
                    message: `You need to wait for the "init" event to be fired before trying to build astro files`
                }
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
                        format: "esm",
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
                    details: {
                        type: `build complete`,
                        values: files,
                        js, html, shiki
                    }
                });
            } catch (error) {
                let err = (error?.error ?? error);
                port.postMessage({
                    event: "error",
                    details: {
                        type: `${error?.type ?? "esbuild"} error`,
                        error: err
                    }
                });

                return;
            }
        })();
    }, 100));

    port.onmessage = ({ data }) => {
        WorkerEvents.emit(data.event, data.details);
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