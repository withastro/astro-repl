import { ModuleWorkerSupported } from './index';
import { renderPage } from '../@astro/internal/index';

export async function renderAstroToHTML(content: string): Promise<string | { errors: string[] }> {
    let mod;
    let html;

    var bundler;
    try {
        if (ModuleWorkerSupported) {
            const url = `data:application/javascript;base64,${Buffer.from(content).toString('base64')}`;
            ({ default: mod } = await import(url));
        } else {
            ({ default: mod } = new Function(`${content} return bundler;`)());
        }
    } catch (e) {
        return {
            errors: [e]
        }
    }
    if (!mod) {
        return;
    }

    try {
        html = await renderPage({
            styles: new Set(),
            scripts: new Set(),
            /** This function returns the `Astro` faux-global */
            createAstro(props: any) {
                // const site = location;
                const url = new URL('http://localhost:3000/')
                // const canonicalURL = getCanonicalURL(pathname, astroConfig.buildOptions.site || origin)
                return { isPage: true, site: url, request: { url, canonicalURL: url }, props };
            },
        }, await mod, {}, {});
    } catch (e) {
        return {
            errors: [e]
        }
    }
    return html;
}
