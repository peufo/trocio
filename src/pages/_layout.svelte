<script lang="ts">
  import { page } from '@roxi/routify'
  import { MaterialApp } from 'svelte-materialify/src'

  import Header from '$lib/layout/Header.svelte'
  import Footer from '$lib/layout/Footer.svelte'
  import FadeDecorator from '$lib/layout/Fade.svelte'
  import { layout, isDarkTheme } from '$lib/store/layout'

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
  </MaterialApp>
</div>
