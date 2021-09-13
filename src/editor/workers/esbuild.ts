import type { Dirent } from "fs";
import { initialize, build, BuildResult, OutputFile, BuildIncremental } from "esbuild-wasm/esm/browser";

import path from "path";
import { fs, vol } from "memfs";

import { ALIAS } from "../plugins/alias";
import { EXTERNAL } from "../plugins/external";
import { ENTRY } from "../plugins/entry";
import { JSON_PLUGIN } from "../plugins/json";
import { BARE } from "../plugins/bare";
import { HTTP } from "../plugins/http";
import { CDN } from "../plugins/cdn";
import { VIRTUAL_FS } from "../plugins/virtual-fs";
import { WASM } from "../plugins/wasm";

let _initialized = false;

vol.fromJSON({}, "/");

const post = data => self.postMessage(data);

const init = async () => {
    try {
        if (!_initialized) {
            _initialized = true;
            
            await initialize({
                worker: false,
                wasmURL: `/play/esbuild.wasm`
            });

            post({
                ready: `esbuild has not initialized. \nYou need to wait for the promise returned from "initialize" to be resolved before trying to bundle`,
            });
        }
    } catch (error) {
        console.error(error);
        post({
            type: `initialize esbuild error`,
            error
        });
    }
};

export let result: BuildResult & {
    outputFiles: OutputFile[];
} | BuildIncremental;

const readdir = (p: string) => {
    return [].concat(...fs.readdirSync(p, { withFileTypes: true }).map((ent: Dirent) => {
        const name = path.join(p, ent.name);
        if (ent.isDirectory()) {
            return readdir(name)
        }
        return name
    }));
};

self.onmessage = async ({ data }) => {
    data = JSON.parse(data);
    let filename: string = `${data.filename}`;
    let outfile = `/dist/${filename.slice('/src/pages/'.length)}`;
    let input: string = `${data.value}`; // Ensure input is a string

    let content: string;
    if (!_initialized) {
        await init();
    }

    fs.mkdirpSync(path.dirname(filename));
    fs.writeFileSync(filename, input);

    // use esbuild to bundle files
    try {
        result = await build({
            entryPoints: ['<stdin>'],
            bundle: true,
            minify: true,
            sourcemap: 'inline',
            color: true,
            incremental: false,
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
                VIRTUAL_FS(filename),
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

        if (result.errors && result.errors.length > 0) {
            post({
                type: 'esbuild build error',
                error: result.errors[0]
            })
            return;
        }

        content = await fs.promises.readFile(outfile, "utf-8") as string;
        content = content?.trim?.(); // Remove unesscary space
    } catch (error) {
        post({
            type: `esbuild build error`,
            error
        });
        return;
    }
    post({
        value: { input, content }
    });
};
