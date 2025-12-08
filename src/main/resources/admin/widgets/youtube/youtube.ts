// @ts-expect-error No types
import {render} from '/lib/mustache';
import {assetUrl} from '/lib/enonic/asset';

export function get() {
    const view = resolve('./youtube.html');
    const videos = (app.config['youtube.videos'] || '').split(',') || [];

    const params = {
        stylesUrl: assetUrl({
          path: 'styles/widgets/youtube.css'
        }),
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
}
