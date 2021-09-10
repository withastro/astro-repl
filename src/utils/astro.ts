import { renderPage } from '../@astro/internal/index.ts';

export async function renderAstroToHTML(content: string) {
    const url = `data:application/javascript;base64,${Buffer.from(content).toString('base64')}`;

    const { default: mod } = await import(url);
    const html = await renderPage({
        styles: new Set(),
        scripts: new Set(),
        /** This function returns the `Astro` faux-global */
        createAstro(props: any) {
            // const site = location;
            const url = new URL('http://localhost:3000/')
            // const canonicalURL = getCanonicalURL(pathname, astroConfig.buildOptions.site || origin)
            return { isPage: true, site: url, request: { url, canonicalURL: url }, props };
        },
    }, await mod, {}, null);
    return html;
}
