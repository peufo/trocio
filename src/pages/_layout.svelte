<script lang="ts">
  import { page } from '@roxi/routify'
  import { MaterialApp, Button } from 'svelte-materialify'

  import Header from '$lib/layout/Header.svelte'
  import Footer from '$lib/layout/Footer.svelte'
  import FadeDecorator from '$lib/decorator/Fade.svelte'
  import { isDarkTheme } from '$lib/stores.js'
  import { layout } from '$lib/store/layout'

  import '$assets/Pnotify_Material.css'
  import '$assets/index.css'
  import icon from '$assets/favicon.ico'

  let innerHeight = 0 // Window height
  let headerHeight = 0 // Header height
  let mainHeight = 0 // Main content height
  let footerHeight = 0 // Footer height

  $: {
    mainHeight = innerHeight - headerHeight
    if ($page.meta.isFooterDisplay) mainHeight -= footerHeight
    $layout = { headerHeight, footerHeight, mainHeight, innerHeight }
  }
</script>

<svelte:head>
  <link rel="icon" href={icon} />
</svelte:head>

<svelte:window bind:innerHeight />

<div style={`min-height: ${innerHeight}px;`}>
  <MaterialApp theme={$isDarkTheme ? 'dark' : 'light'}>
    <Header bind:offsetHeight={headerHeight} />

    <div style="min-height: {mainHeight}px;">
      <slot decorator={FadeDecorator} scoped={$layout} />
    </div>

    {#if $page.meta.isFooterDisplay}
      <Footer bind:offsetHeight={footerHeight} />
    {/if}

    <!-- Theme Button-->
    <Button
      icon
      style="position: fixed!important; right: 5px; bottom: 5px;"
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
