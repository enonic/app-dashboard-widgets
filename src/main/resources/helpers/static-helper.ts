import {requestHandler, RESPONSE_CACHE_CONTROL} from '/lib/enonic/static';
import {Request} from '@enonic-types/core';

const STATIC_BASE = '_static';
const STATIC_MARKER = `/${STATIC_BASE}/`;
const STATIC_ASSETS_REGEXP = new RegExp(`${STATIC_MARKER}.+$`);

function serveStatic(req: Request) {
  return requestHandler(req, {
    cacheControl: () => RESPONSE_CACHE_CONTROL.SAFE,
    relativePath: (r: Request) => {
      const idx = r.rawPath.indexOf(STATIC_MARKER);
      return idx >= 0 ? r.rawPath.substring(idx + STATIC_MARKER.length - 1) : '';
    },
    root: 'assets',
    index: false,
  });
}

export function handleRequest<T>(req: Request, renderer: (staticBaseUrl: string) => T): T | ReturnType<typeof serveStatic> {
  if (STATIC_ASSETS_REGEXP.test(req.rawPath)) {
    return serveStatic(req);
  }
  return renderer(`${req.rawPath}/${STATIC_BASE}`);
}
