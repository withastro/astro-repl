import type { Highlighter } from 'shiki';
import { transform, initialize } from '@astrojs/compiler';
import prettier from 'prettier/esm/standalone.mjs';
import parserBabel from 'prettier/esm/parser-babel.mjs';
import { getHighlighter, setCDN } from 'shiki';

let _initialized = false
let highlighter: Highlighter;
const post = data => self.postMessage(data);

const init = async () => {
    if (!_initialized) {
        setCDN('https://unpkg.com/shiki/')
        await initialize({ wasmURL: '/play/astro.wasm' });
        highlighter = await getHighlighter({ theme: 'github-light', langs: ['ts'] });
        _initialized = true;
    }
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
    return {__current: performance.now()};
}

self.onmessage = async ({ data }) => {
    const timing = createTimestamp();
    data = JSON.parse(data);
    let filename: string = `${data.filename}`;
    let input: string = `${data.value}`;

    let content: string;
    if (!_initialized) {
        await init();
    }
    timestamp(timing, 'init');
    try {
        content = await transform(input, { sourcefile: filename, internalURL: 'astro/internal', sourcemap: false }).then(res => res.code);
        timestamp(timing, 'compile');
        content = prettier.format(content, {
            parser: 'babel',
            plugins: [parserBabel]
        })
        timestamp(timing, 'format');
        content = highlighter.codeToHtml(content, 'ts');
        timestamp(timing, 'highlight');
    } catch (error) {
        post({
            type: `astro transform error`,
            error
        });
        return;
    }
    timestamp(timing, 'total');
    post({
        value: { content, input },
        timing,
    });
};
