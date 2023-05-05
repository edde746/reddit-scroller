import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url, params, fetch }) => {
  const response = await fetch(`/r/${params.subreddit}/.json?${url.searchParams.toString()}`).then((res) => res.json());

  return {
    params: [...url.searchParams],
    ...response,
  };
};
