<script lang="ts">
  import { onMount } from 'svelte';
  import type { PageData } from './$types';
  import Subreddit from './subreddit.svg';
  import Header from '$lib/Header.svelte';
  import { page } from '$app/stores';

  export let data: PageData;
  const filters = { curated: 'Curated', sfw: 'SFW', all: 'All', nsfw: 'NSFW' };
  $: filter = ($page.params.filter || 'curated') as keyof typeof filters;

  const numberFormatter = new Intl.NumberFormat('en-US', { notation: 'compact' });

  const curatedSubreddits = [
    'pics',
    'shitposting',
    'memes',
    'minecraft',
    'mildlyinteresting',
    'stablediffusion',
    'greentext',
    'oddlysatisfying',
    'dataisbeautiful',
    'cats',
    'aww',
    'dankmemes',
    'wholesomememes',
    'mapporn',
    'art',
    'atbge',
    'videos',
  ];

  $: filtered = data.subreddits.filter((sub) => {
    if (filter === 'all') return true;
    if (filter === 'sfw') return !sub.nsfw;
    if (filter === 'nsfw') return sub.nsfw;
    if (filter === 'curated') return curatedSubreddits.includes(sub.name.toLowerCase());
  });

  let nsfwEnabled = false;
  onMount(() => {
    nsfwEnabled = localStorage.getItem('nsfw') === 'true';
  });

  let pageN = 1;
</script>

<svelte:head>
  <title>Discover top subreddits with rscroll.app</title>
  <meta
    name="description"
    content="Effortlessly browse through the top 2000 subreddits with rscroll.app, your one-stop destination for viewing diverse content across a variety of communities."
  />
</svelte:head>

<svelte:window
  on:scroll={() => {
    if (window.innerHeight * 1.5 + window.scrollY >= document.body.offsetHeight) {
      pageN++;
    }
  }}
/>

<Header title="Subreddit List" />

<div class="segmented-control mb-2">
  {#each Object.entries(filters) as [key, label]}
    <a
      class:active={filter === key}
      on:click={(e) => {
        if (key != 'sfw' && key != 'curated' && !nsfwEnabled) {
          nsfwEnabled = confirm('Do you wish to enable NSFW content?');
          localStorage.setItem('nsfw', String(nsfwEnabled));
          if (!nsfwEnabled) return e.preventDefault();
        }
        pageN = 1;
      }}
      href="/{key}"
    >
      {label}
    </a>
  {/each}
</div>
<p class="text-center mb-12">Showing {Math.min(filtered.length, 150 * pageN)} of {filtered.length} subreddits</p>

<div class="grid gap-1 subreddits">
  {#each filtered.slice(0, 150 * pageN) as subreddit}
    <a href={subreddit.href}>
      <img
        src={subreddit.icon == '' ? Subreddit : subreddit.icon}
        alt={subreddit.name + ' icon'}
        class:dark:invert={subreddit.icon == ''}
        loading="lazy"
      />
      <p class="">r/{subreddit.name}</p>
      <span>({numberFormatter.format(subreddit.subscribers)} subscribers)</span>
      <div class="ml-auto">&rarr;</div>
    </a>
  {/each}
</div>

<style>
  .subreddits > a {
    @apply flex gap-2 items-center hover:dark:bg-neutral-800/50 hover:bg-neutral-200 px-3 py-2 rounded-lg;
  }

  .subreddits > a > img {
    @apply w-8 h-8 rounded-full;
  }

  .subreddits > a > p {
    @apply font-semibold text-lg;
  }

  .subreddits > a > span {
    @apply text-sm text-neutral-500 dark:text-neutral-400;
  }

  .segmented-control {
    @apply flex gap-1 rounded-lg mx-auto dark:bg-neutral-800 bg-neutral-100 w-max px-3 py-2;
  }

  .segmented-control > a {
    @apply flex-1 rounded-lg py-1 px-2 text-sm font-medium text-neutral-700 dark:text-neutral-200;
  }

  .segmented-control > a.active {
    @apply bg-white dark:bg-neutral-700;
  }
</style>
