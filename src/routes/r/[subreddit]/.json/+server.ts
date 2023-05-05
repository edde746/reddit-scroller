import { RequestHandler } from '@sveltejs/kit';
import { json } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ url, params }) => {
  const { subreddit } = params;
  const after = url.searchParams.get('after');
  const sort = url.searchParams.get('sort') || 'hot';
  const time = url.searchParams.get('time') || 'day';

  const redditUrl = new URL(`https://www.reddit.com/r/${subreddit}/${sort}.json`);
  if (after) redditUrl.searchParams.set('after', after);
  if (time) redditUrl.searchParams.set('t', time);

  const response = await fetch(redditUrl.toString(), {
    headers: {
      'User-Agent': process.env.USER_AGENT,
    },
  })
    .then((res) => res.json())
    .then((res) => res.data);

  return json({
    after: response.after,
    children: [
      response.children.map((child) => ({
        id: child.data.id,
        title: child.data.title,
        nsfw: child.data.over_18,
        preview: child.data.preview,
        url: (() => {
          if (child.data?.preview?.reddit_video_preview) {
            return child.data.preview.reddit_video_preview.fallback_url;
          }

          return child.data.url;
        })(),
        originalUrl: child.data.url,
      })),
    ],
  });
};
