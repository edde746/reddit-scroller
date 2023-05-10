<script lang="ts">
  import { page } from '$app/stores';
  import Sorting from '$lib/Sorting.svelte';
  import { onMount } from 'svelte';
  import type { PageData } from './$types';
  import { inview } from 'svelte-inview';
  import Header from '$lib/Header.svelte';
  import he from 'he';

  export let data: PageData;

  let postsInView: string[] = [];
  let errored: string[] = [];

  let loading = false,
    outOfPosts = false;

  const inviewOptions = {
    rootMargin: '100px',
  };

  let nsfwEnabled = false;
  onMount(() => {
    nsfwEnabled = localStorage.getItem('nsfw') === 'true';
  });

  $: postCount = data.children.flat().reduce((acc, cur) => {
    return cur.preview?.images[0]?.source && cur.url && !errored.includes(cur.id) ? acc + 1 : acc;
  }, 0);

  let mediaWidth = 0;

  const findBestFittingImageUrl = (
    imageVariations: { url: string; width: number; height: number }[],
    elementWidth: number
  ) => {
    imageVariations.sort((a, b) => a.width - b.width);

    const bestFit = imageVariations.find((variation) => variation.width >= elementWidth);

    return he.decode(bestFit ? bestFit.url : imageVariations[imageVariations.length - 1].url);
  };
</script>

<svelte:window
  on:scroll={() => {
    if (loading || outOfPosts || postCount == 0) return;
    if (window.innerHeight * 1.5 + window.scrollY >= document.body.offsetHeight) {
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

{#each data.children as page, i}
  <div class="columns-3 gap-4">
    {#each page as post}
      {@const firstImage = post.preview?.images[0]?.source}
      {@const isPostInView = postsInView.includes(post.id)}
      <div
        class="break-inside-avoid"
        bind:clientWidth={mediaWidth}
        use:inview={inviewOptions}
        on:inview_change={(event) => {
          if (event.detail.inView) {
            postsInView = [...postsInView, post.id];
          } else {
            postsInView = postsInView.filter((p) => p !== post.id);
          }
        }}
      >
        {#if firstImage && post.url && !errored.includes(post.id)}
          <a
            class="w-full mb-4 relative block"
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
                  src={findBestFittingImageUrl(post.preview.images[0].resolutions, mediaWidth)}
                  alt={post.title}
                  class="media"
                  on:error={() => {
                    console.log('error', post.url);
                    errored = [...errored, post.id];
                  }}
                />
              {/if}
            {/if}
          </a>
        {/if}
      </div>
    {/each}
  </div>

  {#if i != data.children.length - 1}
    <div class="my-5 flex items-center gap-4">
      <hr class="w-full" />
      <div class="text-center shrink-0">Page {i + 1}</div>
      <hr class="w-full" />
    </div>
  {/if}
{/each}

{#if loading}
  <div class="flex w-full justify-center my-5">
    <svg
      class="animate-spin h-5 w-5 dark:text-white text-black"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
      <path
        class="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  </div>
{/if}

{#if outOfPosts || postCount == 0}
  <div class="flex w-full justify-center my-5 text-lg">No more posts</div>
{/if}

<style>
  .media {
    @apply w-full mb-4 absolute inset-0 z-10;
  }
</style>
