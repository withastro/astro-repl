import { renderPage, createResult, CreateResultArgs } from '../@astro/internal/index';
import { b64EncodeUnicode } from "./b64";

export async function renderAstroToHTML(content: string, ModuleWorkerSupported: boolean): Promise<string | { errors: string[] }> {
  let mod;
  let html;

  var bundler;
  const slots = new Proxy({}, {
    get(target, prop, receiver) {
      return () => null
    }
  })

  try {
      if (ModuleWorkerSupported) {
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
		const result = createResult({ 
      astroConfig: { 
        buildOptions: {} 
      },
      origin: globalThis.location.origin,
      params: {}
    } as unknown as CreateResultArgs);

    html = await renderPage(result, await mod, {}, slots);
  } catch (e) {
    return {
      errors: e // [e],
    };
  }
  return html;
}
