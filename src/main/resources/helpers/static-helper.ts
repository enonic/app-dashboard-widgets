import {mappedRelativePath, requestHandler, RESPONSE_CACHE_CONTROL} from '/lib/enonic/static';
import Router from '/lib/router';
import {Request, Response} from '@enonic-types/core';

const BASE_PATH = '';
const STATIC_BASE_PATH = `${BASE_PATH}/_static`;

export type WidgetRenderer = (req: Request, staticBaseUrl: string) => Response;

export function createWidgetRouter(renderer: WidgetRenderer) {
    const router = Router();

    router.get(BASE_PATH, (req: Request) => renderer(req, `${req.path}${STATIC_BASE_PATH}`));

    router.get(`${STATIC_BASE_PATH}/{path:.*}`, (req: Request) => requestHandler(req, {
        cacheControl: () => RESPONSE_CACHE_CONTROL.SAFE,
        index: false,
        root: '/assets',
        relativePath: mappedRelativePath(STATIC_BASE_PATH),
    }));

    return router;
}
