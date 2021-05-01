<script>
  import { page } from '@roxi/routify'
  import { MaterialApp, Button } from 'svelte-materialify'

  import Head from '$lib/Head.svelte'
  import Footer from '$lib/layout/Footer.svelte'
  import FadeDecorator from '$lib/decorator/Fade.svelte'
  import { isDarkTheme } from '$lib/stores.js'

  let innerHeight // Window height
  let headerHeight // Header height
  let mainHeight // Main content height
  let footerHeight // Footer height

  $: {
    mainHeight = innerHeight - headerHeight
    if ($page.meta.isFooterDisplay) mainHeight -= footerHeight
  }
</script>

<svelte:window bind:innerHeight />

<div style={`min-height: ${innerHeight}px;`}>
  <MaterialApp theme={$isDarkTheme ? 'dark' : 'light'}>
    <Head bind:offsetHeight={headerHeight} />

    <div style="min-height: {mainHeight}px;">
      <slot
        decorator={FadeDecorator}
        scoped={{ headerHeight, footerHeight, mainHeight }}
      />
    </div>

    {#if $page.meta.isFooterDisplay}
      <Footer bind:offsetHeight={footerHeight} />
    {/if}

    <!-- Theme Button-->
    <Button
      icon
      class="toggleTheme"
      on:click={() => ($isDarkTheme = !$isDarkTheme)}
    >
      {#if $isDarkTheme}
        <i class="fas fa-sun" />
      {:else}
        <i class="fas fa-moon" />
      {/if}
    </Button>
  </MaterialApp>
</div>

<style global>
  .toggleTheme {
    position: fixed !important;
    right: 5px;
    bottom: 5px;
  }
</style>
