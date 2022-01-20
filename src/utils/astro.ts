import type { SSRElement } from 'astro';
import { renderPage, createResult, CreateResultArgs } from '../@astro/internal/index';
import { b64EncodeUnicode } from "./b64";

function pathJoin(parts, sep){
  var separator = sep || '/';
  var replace   = new RegExp(separator+'{1,}', 'g');
  return parts.join(separator).replace(replace, separator);
}

export async function renderAstroToHTML(content: string, ModuleWorkerSupported: boolean): Promise<string | { errors: string[] }> {
  let mod;
  let html;

  var bundler;
  try {
      if (ModuleWorkerSupported) {
        console.log(content)
          const url = `data:application/javascript;base64,${b64EncodeUnicode(content)}`;
          ({ default: mod } = await import(url));
      } else {
          ({ default: mod } = new Function(`${content} return bundler;`)());
      }
  } catch (e) {
      return {
          errors: e
      }
  }
  if (!mod) {
      return;
  }

  try {
    const localHost = new URL('http://localhost/');
		const result = createResult({ 
      astroConfig: { 
        buildOptions: {} 
      },
      origin: globalThis.location.origin,
      params: {}
    } as unknown as CreateResultArgs);

		html = await renderPage(result, await mod, {}, null);
  } catch (e) {
    return {
      errors: e // [e],
    };
  }
  return html;
}
