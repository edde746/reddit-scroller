<script lang="ts">
  import { navigating, page } from '$app/stores';
  import Sorting from '$lib/Sorting.svelte';
  import { onMount } from 'svelte';
  import type { PageData } from './$types';
  import { inview } from 'svelte-inview';
  import Header from '$lib/Header.svelte';
  import he from 'he';
  import Spinner from '$lib/Spinner.svelte';
  import Masonry from '@edde746/svelte-masonry';

  export let data: PageData;

  let postsInView: string[] = [];
  let errored: string[] = [];

  let loading = false,
    outOfPosts = false;

  const inviewOptions = {
    rootMargin: '150% 0px',
    threshold: 0,
  };

  let nsfwEnabled = false;
  onMount(() => {
    nsfwEnabled = localStorage.getItem('nsfw') === 'true';
  });

  const filterPost = (post: any) => {
    if (!post.preview?.images?.at(0)?.source || !post.url) return false;
    if (errored.includes(post.id)) return false;
    return true;
  };

  $: postCount = data.children.flat().reduce((acc, cur) => {
    return filterPost(cur) ? acc + 1 : acc;
  }, 0);

  const findBestFittingImageUrl = (
    imageVariations: { url: string; width: number; height: number }[],
    elementWidth: number
  ) => {
    imageVariations.sort((a, b) => a.width - b.width);

    const bestFit = imageVariations.find((variation) => variation.width >= elementWidth);

    return he.decode(bestFit ? bestFit.url : imageVariations[imageVariations.length - 1].url);
  };

  $: $navigating &&
    (() => {
      postsInView = [];
      errored = [];
      loading = false;
      outOfPosts = false;
    })();
</script>

<svelte:window
  on:scroll={() => {
    if (loading || outOfPosts || postCount == 0) return;
    if (window.innerHeight * 1.6 + window.scrollY >= document.body.offsetHeight) {
      loading = true;

      const params = Object.fromEntries(data.params);
      params.after = data.after;

      fetch(`/r/${$page.params.subreddit}/json?${new URLSearchParams(params)}`)
        .then((res) => res.json())
        .then((res) => {
          data.children = [...data.children, ...res.children];
          data.after = res.after;
          loading = false;
          if (!res.after || res.children.length === 0) outOfPosts = true;
        });
    }
  }}
/>

<svelte:head>
  <title>r/{$page.params.subreddit} - rscroll.app</title>
  <meta
    name="description"
    content="Discover the latest memes, pictures, videos, and more from r/{$page.params
      .subreddit} with rscroll.app, an infinite Reddit scroll viewer."
  />
</svelte:head>

<Header title="r/{$page.params.subreddit}">
  <Sorting />
</Header>

{#if $navigating}
  <div class="flex w-full justify-center my-5">
    <Spinner />
  </div>
{:else}
  <Masonry update={postCount} rearrange>
    {#each data.children.flat().filter(filterPost) as post}
      {@const firstImage = post.preview?.images[0]?.source}
      {@const isPostInView = postsInView.includes(post.id)}
      <div
        class="media-container"
        use:inview={inviewOptions}
        on:inview_change={(event) => {
          if (event.detail.inView) {
            postsInView = [...postsInView, post.id];
          } else {
            postsInView = postsInView.filter((p) => p !== post.id);
          }
        }}
      >
        <a
          class="w-full relative block"
          style="aspect-ratio: {firstImage.width}/{firstImage.height}"
          href={post.url}
          on:click={(e) => {
            if (post.nsfw && !nsfwEnabled) {
              nsfwEnabled = confirm('Do you wish to enable NSFW content?');
              localStorage.setItem('nsfw', String(nsfwEnabled));
              e.preventDefault();
            }
          }}
          target="_blank"
          rel="noopener noreferrer"
        >
          {#if post.nsfw && !nsfwEnabled}
            <div
              class="absolute inset-0 backdrop-blur-lg z-20 flex items-center justify-center flex-col text-lg font-bold"
            >
              NSFW
            </div>
          {/if}
          <div class="absolute inset-0 bg-neutral-200 dark:bg-neutral-800" />
          {#if isPostInView}
            {#if post.media?.reddit_video}
              <video src={post.media.reddit_video.fallback_url} class="media" autoplay loop muted />
            {:else if post.preview?.reddit_video_preview}
              <video src={post.preview.reddit_video_preview.fallback_url} class="media" autoplay loop muted />
            {:else if post.preview?.images[0]}
              <img
                src={findBestFittingImageUrl(
                  post.preview.images[0].resolutions,
                  document.querySelector('.media-container')?.clientWidth || 300
                )}
                alt={post.title}
                class="media"
                on:error={() => (errored = [...errored, post.id])}
              />
            {/if}
          {/if}
        </a>
      </div>
    {/each}
  </Masonry>

  {#if loading}
    <div class="flex w-full justify-center my-5">
      <Spinner />
    </div>
  {/if}

  {#if outOfPosts || postCount == 0}
    <div class="flex w-full justify-center my-5 text-lg">No more posts</div>
  {/if}
{/if}

<style>
  .media {
    @apply w-full mb-4 absolute inset-0 z-10;
  }

  .media-container {
    @apply break-inside-avoid;
  }
</style>
