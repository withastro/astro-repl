import { renderPage, createResult } from '../@astro/internal/index';
import { b64EncodeUnicode } from "./b64";
import type {
  Params,
  SSRElement,
  SSRLoadedRenderer,
} from "astro";

import type { MarkdownRenderingOptions } from '@astrojs/markdown-remark';

export type LoggerLevel = 'debug' | 'info' | 'warn' | 'error' | 'silent'; // same as Pino
export type LoggerEvent = 'info' | 'warn' | 'error';
export interface LogMessage {
  type: string | null;
  level: LoggerLevel;
  message: string;
  args: Array<any>;
}
interface LogWritable<T> {
  write: (chunk: T) => boolean;
}

export interface LogOptions {
  dest: LogWritable<LogMessage>;
  level: LoggerLevel;
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

export async function renderAstroToHTML(content: string, ModuleWorkerSupported: boolean): Promise<Awaited<ReturnType<typeof renderPage>> | { error: string[] }> {
  let mod;
  let html;

  var bundler;
  const slots = new Proxy({}, {
    get(target, prop, receiver) {
      return () => null;
    }
  });

  try {
    if (ModuleWorkerSupported) {
      const url = `data:application/javascript;base64,${b64EncodeUnicode(content)}`;
      ({ default: mod } = await import(url));
    } else {
      ({ default: mod } = new Function(`${content} return bundler;`)());
    }
  } catch (e) {
    return {
      error: e?.toString()
    };
  }

  if (!mod) return;

  try {
    const result = createResult({
      markdown: {},
      params: {},
      pathname: "/",
      renderers: [],
      request: new Request(globalThis.location.origin + "/"),
      resolve: async (s) => s,
      site: globalThis.location.origin,
      ssr: false
    } as CreateResultArgs);

    html = await renderPage(result, await mod, {}, slots);
  } catch (e) {
    return {
      error: e?.toString() // [e],
    };
  }

  console.log("Debuging", html);
  return html;
}
