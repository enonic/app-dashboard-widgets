import {render} from '/lib/mustache';
import {Request} from '@enonic-types/core';
import {createWidgetRouter} from '/helpers/static-helper';
import {getChartData} from '/helpers/chart-data';

const CHART_DATA_PATH = '/_chart-data';

const router = createWidgetRouter((staticBaseUrl: string, req: Request) => {
    const view = resolve('./activity.html');

    const params = {
        jsUri: `${staticBaseUrl}/js/widgets/activity.mjs`,
        stylesUri: `${staticBaseUrl}/styles/widgets/activity.css`,
        chartDataUrl: `${req.contextPath}${CHART_DATA_PATH}`
    };

    return {
        contentType: 'text/html',
        body: render(view, params)
    };
});

router.get(CHART_DATA_PATH, () => ({
    contentType: 'application/json',
    body: getChartData()
}));

export const all = (req: Request) => router.dispatch(req);
