// @ts-expect-error No types
import {render} from '/lib/mustache';
import {assetUrl} from '/lib/enonic/asset';
import {serviceUrl} from '/lib/xp/portal';

export function get() {
  const view = resolve('./activity.html');

  const params = {
    jsUri: assetUrl({
      path: 'js/widgets/activity.mjs'
    }),
    stylesUri: assetUrl({
      path: 'styles/widgets/activity.css'
    }),
    chartDataServiceUrl: serviceUrl({service: 'chartdata'})
  };

  return {
    contentType: 'text/html',
    body: render(view, params)
  };
}
