<script>
  import { onMount } from 'svelte';
  import '../app.postcss';

  onMount(() => {
    if (!import.meta.env.VITE_G_MEASUREMENT_ID) return;
    window.dataLayer = window.dataLayer || [];
    function gtag() {
      window.dataLayer.push(arguments);
    }
    gtag('js', new Date());

    gtag('config', import.meta.env.VITE_G_MEASUREMENT_ID);
  });
</script>

<svelte:head>
  {#if import.meta.env.VITE_G_MEASUREMENT_ID}
    <script async src="https://www.googletagmanager.com/gtag/js?id={import.meta.env.VITE_G_MEASUREMENT_ID}"></script>
  {/if}
</svelte:head>

<div class="max-w-5xl mx-auto p-4">
  <slot />
</div>
