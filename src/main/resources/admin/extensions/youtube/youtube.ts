import {render} from '/lib/mustache';
import {Request} from '@enonic-types/core';
import {handleRequest} from '/helpers/static-helper';

export function get(req: Request) {
    return handleRequest(req, (staticBaseUrl) => {
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
}
