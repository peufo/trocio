<script lang="ts">
  import { afterPageLoad, isActive, page } from '@roxi/routify'
  import { fly } from 'svelte/transition'

  import Navigation from '$lib/troc/Navigation.svelte'
  import TabsTrocs from '$lib/troc/TabsTrocs.svelte'
  import {
    trocNavigationActive,
    isMobile,
    isKeyboardOpen,
  } from '$lib/store/layout'

  let navigationWidth = '360px'

  $: $trocNavigationActive = !$isMobile
  $afterPageLoad(() => {
    // Hide navigation for create form
    if ($isActive('./create')) $trocNavigationActive = false
    else if (!$isMobile) $trocNavigationActive = true
    else if ($isActive('./index')) $trocNavigationActive = true
  })
</script>

<div
  class="layout"
  style="padding-left: {$trocNavigationActive && !$isMobile
    ? navigationWidth
    : '0px'}"
>
  {#if !$isMobile}
    <Navigation
      bind:active={$trocNavigationActive}
      width={navigationWidth}
      mobileMode={false}
    />
  {/if}

  <div class="pb-16" style="width: 100%;">
    <slot />
  </div>

  {#if $isMobile && !$isKeyboardOpen && !$page.path.startsWith('/trocs/:trocId')}
    <nav transition:fly|local={{ y: 72 }}>
      <TabsTrocs />
    </nav>
  {/if}
</div>

<style>
  .layout {
    transition: padding 0.3s;
  }
  nav {
    position: fixed;
    bottom: 0;
    width: 100%;
    height: 72px;
  }
</style>
