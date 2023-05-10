<script lang="ts">
  import { navigating, page } from '$app/stores';
  import Sorting from '$lib/Sorting.svelte';
  import { onMount } from 'svelte';
  import type { PageData } from './$types';
  import { inview } from 'svelte-inview';
  import Header from '$lib/Header.svelte';
  import he from 'he';
  import Spinner from '$lib/Spinner.svelte';

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

  $: postCount = data.children.flat().reduce((acc, cur) => {
    return cur.preview?.images[0]?.source && cur.url && !errored.includes(cur.id) ? acc + 1 : acc;
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

{#if $navigating}
  <div class="flex w-full justify-center my-5">
    <Spinner />
  </div>
{:else}
  {#each data.children as page, i}
    <div class="md:columns-2 lg:columns-3 gap-4">
      {#each page as post}
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
                    src={findBestFittingImageUrl(
                      post.preview.images[0].resolutions,
                      document.querySelector('.media-container').clientWidth
                    )}
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
