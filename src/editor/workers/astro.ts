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

self.onmessage = async ({ data }) => {
    data = JSON.parse(data);
    let filename: string = `${data.filename}`;
    let input: string = `${data.value}`;

    let content: string;
    if (!_initialized) {
        await init();
    }

    try {
        content = await transform(input, { sourcefile: filename, internalURL: 'astro/internal', sourcemap: false }).then(res => res.code);
        content = prettier.format(content, {
            parser: 'babel',
            plugins: [parserBabel]
        })
        content = highlighter.codeToHtml(content, 'ts');
    } catch (error) {
        post({
            type: `astro transform error`,
            error
        });
        return;
    }

    post({
        value: { content, input }
    });
};
