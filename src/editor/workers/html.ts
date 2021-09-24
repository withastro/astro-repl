import type { Highlighter } from 'shiki';
import prettier from 'prettier/esm/standalone.mjs';
import parserHtml from 'prettier/esm/parser-html.mjs';
import parserCss from 'prettier/esm/parser-postcss.mjs';
import parserBabel from 'prettier/esm/parser-babel.mjs';
import { getHighlighter, setCDN } from 'shiki';

let _initialized = false
let highlighter: Highlighter;
const post = data => self.postMessage(data);

const init = async () => {
    if (!_initialized) {
        setCDN('https://unpkg.com/shiki/')
        highlighter = await getHighlighter({ theme: 'github-light', langs: ['html'] });
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
    let input: string = `${data.value}`;
    let content: string = input;
    if (!_initialized) {
        await init();
    }
    timestamp(timing, 'init');
    try {
        content = prettier.format(content, {
            parser: 'html',
            plugins: [parserHtml, parserCss, parserBabel]
        })
        timestamp(timing, 'format');
        content = highlighter.codeToHtml(content, 'html');
        timestamp(timing, 'highlight');
    } catch (error) {
        post({
            type: `html transform error`,
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
