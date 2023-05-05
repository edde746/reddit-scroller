<script lang="ts">
  import { page } from '$app/stores';
  import Header from '$lib/Header.svelte';
  import { onMount } from 'svelte';
  import type { PageData } from './$types';
  import { inview } from 'svelte-inview';

  export let data: PageData;

  let postsInView: string[] = [];
  let errored: string[] = [];

  let loading = false;

  const inviewOptions = {
    rootMargin: '100px',
  };

  let nsfwEnabled = false;
  onMount(() => {
    nsfwEnabled = localStorage.getItem('nsfw') === 'true';
  });
</script>

<svelte:window
  on:scroll={() => {
    if (loading) return;
    if (window.innerHeight * 1.5 + window.scrollY >= document.body.offsetHeight) {
      loading = true;

      const params = Object.fromEntries(data.params);
      params.after = data.after;

      fetch(`/r/${$page.params.subreddit}/.json?${new URLSearchParams(params)}`)
        .then((res) => res.json())
        .then((res) => {
          data.children = [...data.children, ...res.children];
          data.after = res.after;
          loading = false;
        });
    }
  }}
/>

<svelte:head>
  <title>r/{$page.params.subreddit}</title>
</svelte:head>

<Header title="r/{$page.params.subreddit}" />

{#each data.children as page, i}
  <div class="columns-3 gap-4">
    {#each page as post}
      {@const firstImage = post.preview?.images[0]?.source}
      {@const isPostInView = postsInView.includes(post.id)}
      <div
        class="break-inside-avoid"
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
          {@const extension = post.url.split('.').pop()}
          <a
            class="w-full mb-4 relative block"
            style="aspect-ratio: {firstImage.width}/{firstImage.height}"
            href={post.originalUrl}
            on:click={(e) => {
              if (post.nsfw && !nsfwEnabled) {
                nsfwEnabled = confirm('Do you wish to enable NSFW content?');
                localStorage.setItem('nsfw', String(nsfwEnabled));
                if (!nsfwEnabled) e.preventDefault();
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
              {#if ['mp4', 'mov'].includes(extension)}
                <!-- svelte-ignore a11y-media-has-caption -->
                <video src={post.url} class="w-full mb-4 absolute inset-0 z-10" autoplay loop muted />
              {:else}
                <img
                  src={post.url}
                  alt={post.title}
                  class="w-full mb-4 absolute inset-0 z-10"
                  on:error={() => (errored = [...errored, post.id])}
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
