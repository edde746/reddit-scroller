import redis from '$lib/server/redis';
import type { RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async () => {
  const cached = (await redis.get('subreddits').then((res) => JSON.parse(res || '[]'))) as Subreddit[];
};
