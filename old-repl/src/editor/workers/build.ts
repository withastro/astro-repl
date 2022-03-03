import { initialize as EsbuildInitialize, build, formatMessages, type PartialMessage } from "esbuild-wasm/esm/browser";
import { EventEmitter } from "@okikio/emitter";

import { getHighlighter, setCDN } from 'shiki';
import { transform, initialize as AstroInitialize } from '@astrojs/compiler';

// @ts-ignore
import prettier from 'prettier/esm/standalone.mjs';

// @ts-ignore
import parserHtml from 'prettier/esm/parser-html.mjs';

// @ts-ignore
import parserCss from 'prettier/esm/parser-postcss.mjs';

// @ts-ignore
import parserBabel from 'prettier/esm/parser-babel.mjs';

import { EXTERNAL } from "../plugins/external";
import { ENTRY } from "../plugins/entry";
import { HTTP } from "../plugins/http";
import { CDN } from "../plugins/cdn";
import { ALIAS } from "../plugins/alias";
import { VIRTUAL_FS } from "../plugins/virtual-fs";
import { dirname, resolve } from '../../utils/loader';

import { renderAstroToHTML } from "../../utils/astro";
import { encode, decode } from "../../utils/encode-decode";
import { debounce } from "../../utils";

import type { Highlighter } from 'shiki';

// Inspired by https://github.com/egoist/play-esbuild/blob/main/src/lib/esbuild.ts
// I didn't even know this was exported by esbuild, great job @egoist
export const createNotice = async (errors: PartialMessage[], kind: ("error" | "warning") & {} = "error") => {
    let res = await formatMessages(errors, { kind });
    return res.join("\n\n");
}

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

let init = async () => {
    try {
        _initialized = false;
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
};

init();

const start = (port) => {
    const BuildEvents = new EventEmitter();

    const postMessage = (obj: any) => {
        let messageStr = JSON.stringify(obj);
        let encodedMessage = encode(messageStr);
        port.postMessage(encodedMessage, [encodedMessage.buffer]);
    };

    initEvent.on({
        // When the SharedWorker first loads, tell the page that esbuild has initialized  
        init() {
            postMessage({
                event: "init",
                details: {}
            });
        },
        error(err) {
            postMessage({
                event: "error",
                details: {
                    type: `Error initializing, you may need to close and reopen all currently open pages pages`,
                    error: Array.isArray(err) ? err : [err],
                }
            });
        }
    });

    // If another page loads while SharedWorker is still active, tell that page that esbuild is initialized
    if (_initialized)
        initEvent.emit("init");

    const FileSystem = new Map<string, Uint8Array>();
    const getResolvedPath = (path: string, importer?: string) => {
        let resolvedPath = path;
        if (importer && path.startsWith('.'))
            resolvedPath = resolve(dirname(importer), path);
        if (FileSystem.has(resolvedPath)) return resolvedPath;

        throw `File "${resolvedPath}" does not exist`;
    }

    const getFile = (path: string, type: 'string' | 'buffer' = "buffer", importer?: string) => {
        let resolvedPath = getResolvedPath(path, importer);

        if (FileSystem.has(resolvedPath)) {
            let file = FileSystem.get(resolvedPath);
            return type == "string" ? decode(file) : file;
        }
    }

    const setFile = (path: string, content: Uint8Array | string, importer?: string) => {
        let resolvedPath = path;
        if (importer && path.startsWith('.'))
            resolvedPath = resolve(dirname(importer), path);

        try {
            FileSystem.set(resolvedPath, content instanceof Uint8Array ? content : encode(content));
        } catch (e) {
            throw `Error occurred while writing to "${resolvedPath}"`;
        }
    }

    BuildEvents.on("delete", (details) => {
        let { filenames = [] } = details ?? {};
        for (let filename of filenames) {
            if (FileSystem.has(filename)) {
                try {
                    FileSystem.delete(filename);
                } catch (e) {
                    console.warn(`Error deleting "${filename}": `, e)
                }
            }
        }
    });

    BuildEvents.on("build", debounce((details) => {
        if (!_initialized) {
            postMessage({
                event: "warn",
                details: {
                    type: `Build worker not initialized`,
                    message: [`You need to wait for a little bit before trying to bundle astro files`]
                }
            });

            return;
        }

        const { ModuleWorkerSupported } = details;
        let { models = [], current } = details ?? {};
        let files = [];
        let html, js, shiki;

        if (models.length <= 0 && current) models = [current];

        (async () => {
            try {
                // Preload all components and files to avoid esbuild building while still missing files
                for (let data of models) {
                    let filename: string = `${data.filename}`;
                    let input: string = `${data.value}`.trim(); // Ensure input is a string

                    setFile(filename, input);
                }

                /* Esbuild */
                for (let data of models) {
                    let filename: string = `${data.filename}`;
                    let outfile = `/dist/${filename.slice('/src/pages/'.length)}`;
                    let input: string = `${data.value}`.trim(); // Ensure input is a string

                    if (input.length <= 0) continue;

                    let content: string = "";
                    let result: Awaited<ReturnType<typeof build>>;
                    // setFile
                    try {
                        result = await build({
                            // sourcemap: 'inline',
                            entryPoints: ['<stdin>'],
                            bundle: true,
                            minify: true,
                            color: true,
                            sourcemap: false,
                            treeShaking: true,
                            incremental: true,
                            target: ["esnext"],
                            logLevel: 'silent',
                            write: false,
                            outfile,
                            platform: "browser",
                            format: ModuleWorkerSupported ? "esm" : "iife",
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
                                
                                HTTP(ModuleWorkerSupported),
                                CDN(ModuleWorkerSupported),
                                VIRTUAL_FS({ filename, transform, getFile, getResolvedPath }, ModuleWorkerSupported),
                            ],
                            globalName: 'bundler',
                        });
                    } catch (e) {
                        console.log(e)
                        if (e.errors) {
                            throw { type: "esbuild", error: [await createNotice(e.errors, "error")] };
                        } else throw { type: "esbuild", error: [(e?.message ?? e).toString()] };
                    }

                    result?.outputFiles?.forEach(({ path, text }) => {
                        if (path == outfile) 
                            // Remove unesscary space
                            content = text?.trim?.();
                    });

                    if (result?.errors.length > 0)
                        throw { type: "esbuild", error: [await createNotice(result.errors, "error")] };

                    if (result?.warnings.length > 0)
                        postMessage({
                            event: "warn",
                            details: {
                                type: `esbuild warning`,
                                message: [await createNotice(result.warnings, "warning")]
                            }
                        });

                    const output = await renderAstroToHTML(content, ModuleWorkerSupported);
                    if (typeof output === 'string')
                        content = output?.trim?.();
                    else
                        throw { type: "astro-to-html", error: output.errors };

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

                        content = highlighter.codeToHtml(content, { lang: 'ts' });
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

                        content = highlighter.codeToHtml(content, { lang: 'html' });
                        timestamp(timing, 'highlight');

                        timestamp(timing, 'total');
                        shiki = { input, content, timing };
                    } catch (e) {
                        throw { type: "shiki", error: [(e?.message ?? e).toString()] };
                    }
                }

                postMessage({
                    event: "result",
                    details: {
                        type: `Build complete`,
                        values: files,
                        js, html, shiki
                    }
                });
            } catch (error) {
                // Firefox error
                if (String(error).includes('Dynamic module import is disabled or not supported in this context')) {
                  postMessage({
                    event: 'error',
                    details: {
                      type: 'Browser support',
                      error: `This browser doesn't support ESM in workers yet. Please switch to another browser like Chrome.`,
                    },
                  });
                    
                  console.warn(error.error ?? error);
                  return;
                }

                // @ts-ignore
                postMessage({
                    event: "error",
                    details: {
                        type: `${error?.type ?? "Build"} error`,
                        error: (Array.isArray(error.error) ? error.error.join("\n") : error.error.toString()) ?? error?.message ?? error
                    }
                });
                
                console.warn(error?.error ?? error)
            }
        })();
    }, 250));

    port.onmessage = ({ data }) => {
        let { event, details } = JSON.parse(decode(data));
        BuildEvents.emit(event, details);
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