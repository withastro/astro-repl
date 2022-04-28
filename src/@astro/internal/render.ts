import type {
    AstroConfig,
    AstroComponentMetadata,
    AstroGlobalPartial,
    EndpointHandler,
    Params,
    SSRElement,
    SSRLoadedRenderer,
    SSRResult,
    AstroGlobal,
} from "astro";
import type { MarkdownRenderingOptions } from '@astrojs/markdown-remark';
import stringWidth from 'string-width';

import { renderSlot } from './index';
import { extname } from "../../utils/loader";

let FORCE_COLOR, NODE_DISABLE_COLORS, NO_COLOR, TERM, isTTY = true;
// if (typeof process !== 'undefined') {
// 	({ FORCE_COLOR, NODE_DISABLE_COLORS, NO_COLOR, TERM } = process.env);
// 	isTTY = process.stdout && process.stdout.isTTY;
// }

export const $ = {
    enabled: !NODE_DISABLE_COLORS && NO_COLOR == null && TERM !== 'dumb' && (
        FORCE_COLOR != null && FORCE_COLOR !== '0' || isTTY
    )
}

function init(x, y) {
    let rgx = new RegExp(`\\x1b\\[${y}m`, 'g');
    let open = `\x1b[${x}m`, close = `\x1b[${y}m`;

    return function (txt) {
        if (!$.enabled || txt == null) return txt;
        return open + (!!~('' + txt).indexOf(close) ? txt.replace(rgx, close + open) : txt) + close;
    };
}

// modifiers
export const reset = init(0, 0);
export const bold = init(1, 22);
export const dim = init(2, 22);
export const italic = init(3, 23);
export const underline = init(4, 24);
export const inverse = init(7, 27);
export const hidden = init(8, 28);
export const strikethrough = init(9, 29);

// colors
export const black = init(30, 39);
export const red = init(31, 39);
export const green = init(32, 39);
export const yellow = init(33, 39);
export const blue = init(34, 39);
export const magenta = init(35, 39);
export const cyan = init(36, 39);
export const white = init(37, 39);
export const gray = init(90, 39);
export const grey = init(90, 39);

// background colors
export const bgBlack = init(40, 49);
export const bgRed = init(41, 49);
export const bgGreen = init(42, 49);
export const bgYellow = init(43, 49);
export const bgBlue = init(44, 49);
export const bgMagenta = init(45, 49);
export const bgCyan = init(46, 49);
export const bgWhite = init(47, 49);

/** Normalize URL to its canonical form */
export function createCanonicalURL(url: string, base?: string): URL {
    let pathname = url.replace(/\/index.html$/, ''); // index.html is not canonical
    pathname = pathname.replace(/\/1\/?$/, ''); // neither is a trailing /1/ (impl. detail of collections)
    if (!extname(pathname)) pathname = pathname.replace(/(\/+)?$/, '/'); // add trailing slash if there’s no extension
    pathname = pathname.replace(/\/+/g, '/'); // remove duplicate slashes (URL() won’t)
    return new URL(pathname, base);
}

/** Check if a URL is already valid */
export function isValidURL(url: string): boolean {
    try {
        new URL(url);
        return true;
    } catch (e) { }
    return false;
}

// https://vitejs.dev/guide/features.html#css-pre-processors
export const STYLE_EXTENSIONS = new Set([
    '.css',
    '.pcss',
    '.postcss',
    '.scss',
    '.sass',
    '.styl',
    '.stylus',
    '.less',
]);

const cssRe = new RegExp(
    `\\.(${Array.from(STYLE_EXTENSIONS)
        .map((s) => s.slice(1))
        .join('|')})($|\\?)`
);
export const isCSSRequest = (request: string): boolean => cssRe.test(request);

export const SCRIPT_EXTENSIONS = new Set(['.js', '.ts']);
const scriptRe = new RegExp(
    `\\.(${Array.from(SCRIPT_EXTENSIONS)
        .map((s) => s.slice(1))
        .join('|')})($|\\?)`
);
export const isScriptRequest = (request: string): boolean => scriptRe.test(request);

interface LogWritable<T> {
    write: (chunk: T) => boolean;
}

export type LoggerLevel = 'debug' | 'info' | 'warn' | 'error' | 'silent'; // same as Pino
export type LoggerEvent = 'info' | 'warn' | 'error';

export interface LogOptions {
    dest: LogWritable<LogMessage>;
    level: LoggerLevel;
}

function getLoggerLocale(): string {
    const defaultLocale = 'en-US';
    if (typeof process !== 'undefined') {
        if (process?.env?.LANG) {
            const extractedLocale = process?.env?.LANG?.split('.')[0].replace(/_/g, '-');
            // Check if language code is atleast two characters long (ie. en, es).
            // NOTE: if "c" locale is encountered, the default locale will be returned.
            if (extractedLocale.length < 2) return defaultLocale;
            else return extractedLocale.substring(0, 5);
        }
    }

    return defaultLocale;
}

export const dateTimeFormat = new Intl.DateTimeFormat(getLoggerLocale(), {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
});

export interface LogMessage {
    type: string | null;
    level: LoggerLevel;
    message: string;
    args: Array<any>;
}

export const levels: Record<LoggerLevel, number> = {
    debug: 20,
    info: 30,
    warn: 40,
    error: 50,
    silent: 90,
};

/** Full logging API */
export function log(
    opts: LogOptions,
    level: LoggerLevel,
    type: string | null,
    ...args: Array<any>
) {
    const logLevel = opts.level;
    const dest = opts.dest;
    const event: LogMessage = {
        type,
        level,
        args,
        message: '',
    };

    // test if this level is enabled or not
    if (levels[logLevel] > levels[level]) {
        return; // do nothing
    }

    dest.write(event);
}

/** Emit a user-facing message. Useful for UI and other console messages. */
export function info(opts: LogOptions, type: string | null, ...messages: Array<any>) {
    return log(opts, 'info', type, ...messages);
}

/** Emit a warning message. Useful for high-priority messages that aren't necessarily errors. */
export function warn(opts: LogOptions, type: string | null, ...messages: Array<any>) {
    return log(opts, 'warn', type, ...messages);
}

/** Emit a error message, Useful when Astro can't recover from some error. */
export function error(opts: LogOptions, type: string | null, ...messages: Array<any>) {
    return log(opts, 'error', type, ...messages);
}

type LogFn = typeof info | typeof warn | typeof error;

export function table(opts: LogOptions, columns: number[]) {
    return function logTable(logFn: LogFn, ...input: Array<any>) {
        const messages = columns.map((len, i) => padStr(input[i].toString(), len));
        logFn(opts, null, ...messages);
    };
}

export function debug(...args: any[]) {
    if ('_astroGlobalDebug' in globalThis) {
        (globalThis as any)._astroGlobalDebug(...args);
    }
}

function padStr(str: string, len: number) {
    const strLen = stringWidth(str);
    if (strLen > len) {
        return str.substring(0, len - 3) + '...';
    }
    const spaces = Array.from({ length: len - strLen }, () => ' ').join('');
    return str + spaces;
}

export let defaultLogLevel: LoggerLevel;
if (typeof process !== 'undefined') {
    if (process?.argv?.includes?.('--verbose')) {
        defaultLogLevel = 'debug';
    } else if (process?.argv?.includes?.('--silent')) {
        defaultLogLevel = 'silent';
    } else {
        defaultLogLevel = 'info';
    }
} else {
    defaultLogLevel = 'info';
}

/** Print out a timer message for debug() */
export function timerMessage(message: string, startTime: number = Date.now()) {
    let timeDiff = Date.now() - startTime;
    let timeDisplay =
        timeDiff < 750 ? `${Math.round(timeDiff)}ms` : `${(timeDiff / 1000).toFixed(1)}s`;
    return `${message}   ${dim(timeDisplay)}`;
}

/**
 * A warning that SSR is experimental. Remove when we can.
 */
export function warnIfUsingExperimentalSSR(opts: LogOptions, config: AstroConfig) {
    if (config._ctx.adapter?.serverEntrypoint) {
        warn(
            opts,
            'warning',
            bold(`Warning:`),
            `SSR support is still experimental and subject to API changes. If using in production pin your dependencies to prevent accidental breakage.`
        );
    }
}

function onlyAvailableInSSR(name: string) {
    return function () {
        // TODO add more guidance when we have docs and adapters.
        throw new Error(`Oops, you are trying to use ${name}, which is only available with SSR.`);
    };
}

export interface CreateResultArgs {
    ssr: boolean;
    logging: LogOptions;
    origin: string;
    markdown: MarkdownRenderingOptions;
    params: Params;
    pathname: string;
    renderers: SSRLoadedRenderer[];
    resolve: (s: string) => Promise<string>;
    site: string | undefined;
    links?: Set<SSRElement>;
    scripts?: Set<SSRElement>;
    request: Request;
}

function getFunctionExpression(slot: any) {
    if (!slot) return;
    if (slot.expressions?.length !== 1) return;
    return slot.expressions[0] as (...args: any[]) => any;
}

class Slots {
    #cache = new Map<string, string>();
    #result: SSRResult;
    #slots: Record<string, any> | null;

    constructor(result: SSRResult, slots: Record<string, any> | null) {
        this.#result = result;
        this.#slots = slots;
        if (slots) {
            for (const key of Object.keys(slots)) {
                if ((this as any)[key] !== undefined) {
                    throw new Error(
                        `Unable to create a slot named "${key}". "${key}" is a reserved slot name!\nPlease update the name of this slot.`
                    );
                }
                Object.defineProperty(this, key, {
                    get() {
                        return true;
                    },
                    enumerable: true,
                });
            }
        }
    }

    public has(name: string) {
        if (!this.#slots) return false;
        return Boolean(this.#slots[name]);
    }

    public async render(name: string, args: any[] = []) {
        const cacheable = args.length === 0;
        if (!this.#slots) return undefined;
        if (cacheable && this.#cache.has(name)) {
            const result = this.#cache.get(name);
            return result;
        }
        if (!this.has(name)) return undefined;
        if (!cacheable) {
            const component = await this.#slots[name]();
            const expression = getFunctionExpression(component);
            if (expression) {
                const slot = expression(...args);
                return await renderSlot(this.#result, slot).then((res) =>
                    res != null ? String(res) : res
                );
            }
        }
        const content = await renderSlot(this.#result, this.#slots[name]).then((res) =>
            res != null ? String(res) : res
        );
        if (cacheable) this.#cache.set(name, content);
        return content;
    }
}

let renderMarkdown: any = null;

export function createResult(args: CreateResultArgs): SSRResult {
    const { markdown, params, pathname, renderers, request, resolve, site } = args;

    const url = new URL(request.url);
    const canonicalURL = createCanonicalURL('.' + pathname, site ?? url.origin);

    // Create the result object that will be passed into the render function.
    // This object starts here as an empty shell (not yet the result) but then
    // calling the render() function will populate the object with scripts, styles, etc.
    const result: SSRResult = {
        styles: new Set<SSRElement>(),
        scripts: args.scripts ?? new Set<SSRElement>(),
        links: args.links ?? new Set<SSRElement>(),
        /** This function returns the `Astro` faux-global */
        createAstro(
            astroGlobal: AstroGlobalPartial,
            props: Record<string, any>,
            slots: Record<string, any> | null
        ) {
            const astroSlots = new Slots(result, slots);

            const Astro = {
                __proto__: astroGlobal,
                canonicalURL,
                params,
                props,
                request,
                redirect: args.ssr
                    ? (path: string) => {
                        return new Response(null, {
                            status: 301,
                            headers: {
                                Location: path,
                            },
                        });
                    }
                    : onlyAvailableInSSR('Astro.redirect'),
                resolve(path: string) {
                    let extra = `This can be replaced with a dynamic import like so: await import("${path}")`;
                    if (isCSSRequest(path)) {
                        extra = `It looks like you are resolving styles. If you are adding a link tag, replace with this:
---
import "${path}";
---
`;
                    } else if (isScriptRequest(path)) {
                        extra = `It looks like you are resolving scripts. If you are adding a script tag, replace with this:

<script type="module" src={(await import("${path}?url")).default}></script>

or consider make it a module like so:

<script>
	import MyModule from "${path}";
</script>
`;
                    }

                    warn(
                        args.logging,
                        `deprecation`,
                        `${bold(
                            'Astro.resolve()'
                        )} is deprecated. We see that you are trying to resolve ${path}.
${extra}`
                    );
                    // Intentionally return an empty string so that it is not relied upon.
                    return '';
                },
                slots: astroSlots,
            } as unknown as AstroGlobal;

            Object.defineProperty(Astro, '__renderMarkdown', {
                // Ensure this API is not exposed to users
                enumerable: false,
                writable: false,
                // TODO: Remove this hole "Deno" logic once our plugin gets Deno support
                value: async function (content: string, opts: MarkdownRenderingOptions) {
                    // @ts-ignore
                    if (typeof Deno !== 'undefined') {
                        throw new Error('Markdown is not supported in Deno SSR');
                    }

                    if (!renderMarkdown) {
                        // The package is saved in this variable because Vite is too smart
                        // and will try to inline it in buildtime
                        let astroRemark = '@astrojs/markdown-remark';

                        renderMarkdown = (await import(astroRemark)).renderMarkdown;
                    }

                    const { code } = await renderMarkdown(content, { ...markdown, ...(opts ?? {}) });
                    return code;
                },
            });

            return Astro;
        },
        resolve,
        _metadata: {
            renderers,
            pathname,
        },
    };

    return result;
}
