<script lang="ts">
  import { Icon } from '@steeze-ui/svelte-icon';
  import { Flame, ListStart, Calendar } from '@steeze-ui/lucide-icons';
  import { page } from '$app/stores';

  const times = ['hour', 'day', 'week', 'month', 'year', 'all'];
  const titleCase = (str: string) => str[0].toUpperCase() + str.slice(1);

  const sortings = [
    {
      icon: Flame,
      title: 'Hot',
      sorting: 'hot',
    },
    {
      icon: ListStart,
      title: 'Top',
      sorting: 'top',
    },
    {
      icon: Calendar,
      title: 'New',
      sorting: 'new',
    },
  ];
</script>

<nav>
  {#each sortings as sorting}
    <a
      href={(() => {
        const url = new URL($page.url.href);
        url.searchParams.set('sort', sorting.sorting);
        return url.href;
      })()}
      class:active={$page.url.searchParams.get('sort') === sorting.sorting}
    >
      <Icon src={sorting.icon} class="w-6 h-6" />
      <span>{sorting.title}</span>
    </a>
  {/each}
</nav>

{#if $page.url.searchParams.get('sort') === 'top'}
  <div class="segmented-control">
    {#each times as time}
      <a
        href={(() => {
          const url = new URL($page.url.href);
          url.searchParams.set('time', time);
          return url.href;
        })()}
        class:active={($page.url.searchParams.get('time') || 'day') === time}
      >
        {titleCase(time)}
      </a>
    {/each}
  </div>
{/if}

<style>
  nav {
    @apply flex justify-center gap-2 my-5;
  }

  nav > a {
    @apply flex flex-col items-center gap-1 hover:text-neutral-700 dark:hover:text-neutral-300 px-6 py-2 rounded-lg dark:hover:bg-neutral-800 hover:bg-neutral-100;
  }

  nav > a:not(.active) {
    @apply text-neutral-500 dark:text-neutral-400;
  }
</style>
