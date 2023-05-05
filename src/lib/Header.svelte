<script lang="ts">
  import { Icon } from '@steeze-ui/svelte-icon';
  import { Flame, ListStart, Calendar } from '@steeze-ui/lucide-icons';

  export let title: string;
</script>

<h1 class="text-center text-4xl font-bold mb-5">
  {title}
</h1>

<nav>
  <a href="?sort=hot">
    <Icon src={Flame} class="w-6 h-6" />
    <span>Hot</span>
  </a>
  <a href="?sort=top">
    <Icon src={ListStart} class="w-6 h-6" />
    <span>Top</span>
  </a>
  <a href="?sort=new">
    <Icon src={Calendar} class="w-6 h-6" />
    <span>New</span>
  </a>
</nav>

<style>
  nav {
    @apply flex justify-center gap-2 my-5;
  }

  nav > a {
    @apply flex flex-col items-center gap-1 hover:text-neutral-700 dark:hover:text-neutral-300 px-6 py-2 rounded-lg dark:hover:bg-neutral-800 hover:bg-neutral-100;
  }
</style>
