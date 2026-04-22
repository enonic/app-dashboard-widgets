import {render} from '/lib/mustache';
import {serviceUrl} from '/lib/xp/portal';
import {Request} from '@enonic-types/core';
import {handleRequest} from '/helpers/static-helper';

export function get(req: Request) {
  return handleRequest(req, (staticBaseUrl) => {
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
}
