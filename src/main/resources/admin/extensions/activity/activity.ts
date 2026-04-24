import {render} from '/lib/mustache';
import {serviceUrl} from '/lib/xp/portal';
import {Request} from '@enonic-types/core';
import {createWidgetRouter} from '/helpers/static-helper';

const router = createWidgetRouter((_req: Request, staticBaseUrl: string) => {
    const view = resolve('./activity.html');

    const params = {
        jsUri: `${staticBaseUrl}/js/widgets/activity.mjs`,
        stylesUri: `${staticBaseUrl}/styles/widgets/activity.css`,
        chartDataServiceUrl: serviceUrl({service: 'chartdata'})
    };

    return {
        contentType: 'text/html',
        body: render(view, params)
    };
});

export const all = (req: Request) => router.dispatch(req);
