<script lang="ts">
  export let title: string;
</script>

<div class="my-12">
  <a href="/">
    <h1 class="w-full text-center text-3xl font-bold">rscroll.app</h1>
  </a>
  <h2 class="text-center text-lg text-neutral-700 dark:text-neutral-300">{title}</h2>

  <slot />
</div>
