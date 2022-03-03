import { ASTRO_HOST, BASE_URL } from '../utils/constants';
import { registerRoute } from "workbox-routing";

import type { RouteHandlerCallbackContext } from "workbox-routing/types/RouteHandler";

registerRoute(
new RegExp(`^https?:\/\/${ASTRO_HOST}/${BASE_URL}\/(\/.*)$`),
    async ({
        request,
        params,
        url,
    }: RouteHandlerCallbackContext): Promise<Response> => {
        const req = request?.url || url.toString();
        const [pathname] = params as string[];
        // send the request to vite worker
        const response = await postToViteWorker(pathname);
        return response;
    }
);