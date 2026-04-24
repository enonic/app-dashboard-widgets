import {mappedRelativePath, requestHandler, RESPONSE_CACHE_CONTROL} from '/lib/enonic/static';
import Router from '/lib/router';
import {Request, Response} from '@enonic-types/core';

const BASE_PATH = '';
const STATIC_BASE_PATH = `${BASE_PATH}/_static`;

export type WidgetRenderer = (staticBaseUrl: string, req?: Request) => Response;

export function createWidgetRouter(renderer: WidgetRenderer) {
    const router = Router();

    router.get(BASE_PATH, (req: Request) => renderer(`${req.contextPath}${STATIC_BASE_PATH}`, req));

    router.get(`${STATIC_BASE_PATH}/{path:.*}`, (req: Request) => requestHandler(req, {
        index: false,
        root: '/assets',
        relativePath: mappedRelativePath(STATIC_BASE_PATH),
    }));

    return router;
}
