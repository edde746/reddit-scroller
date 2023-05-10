import redis from '$lib/server/redis';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

interface Subreddit {
  name: string;
  icon: string;
  href: string;
  subscribers: number;
  nsfw: boolean;
}

export const load: PageServerLoad = async () => {
  const cached = await redis.get('subreddits');
  if (cached) return JSON.parse(cached) as { subreddits: Subreddit[] };

  // authenticate
  const auth = await fetch('https://www.reddit.com/api/v1/access_token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${Buffer.from(`${process.env.REDDIT_CLIENT_ID}:${process.env.REDDIT_SECRET}`).toString(
        'base64'
      )}`,
    },
    body: `grant_type=password&username=${process.env.REDDIT_USERNAME}&password=${process.env.REDDIT_PASSWORD}`,
  }).then((res) => res.json());

  if (!auth.access_token) {
    console.error('Authentication failed', auth);
    throw error(500, 'Reddit authentication failed');
  }

  let after = '';
  let subreddits = [] as Subreddit[];
  for (let i = 0; i < 25; i++) {
    const response = await fetch(`https://oauth.reddit.com/subreddits/popular.json?limit=100&after=${after}`, {
      headers: {
        Authorization: `Bearer ${auth.access_token}`,
        'User-Agent': process.env.USER_AGENT,
      },
    }).then((res) => res.json());

    try {
      subreddits = [
        ...subreddits,
        ...response.data.children.map((child: any) => ({
          name: child.data.display_name,
          icon: child.data.icon_img,
          href: child.data.url,
          subscribers: child.data.subscribers,
          nsfw: child.data.over18,
        })),
      ];
      if (!response.data.after) break;
      after = response.data.after;
    } catch (e) {
      console.log(response);
      throw e;
    }
  }

  await redis.set('subreddits', JSON.stringify({ subreddits }));

  return { subreddits };
};
