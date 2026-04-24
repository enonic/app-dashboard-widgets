import {render} from '/lib/mustache';
import {Request} from '@enonic-types/core';
import {createWidgetRouter} from '/helpers/static-helper';

const router = createWidgetRouter((staticBaseUrl: string) => {
    const view = resolve('./youtube.html');
    const videos = (app.config['youtube.videos'] || '').split(',') || [];

    const params = {
        stylesUrl: `${staticBaseUrl}/styles/widgets/youtube.css`,
        videos: videos.map((video) => {
          return {
            videoId: video
          };
        })
    };

    return {
        contentType: 'text/html',
        body: render(view, params)
    };
});

export const all = (req: Request) => router.dispatch(req);
