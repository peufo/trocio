<script lang="ts">
  import { afterPageLoad, isActive } from '@roxi/routify'

  import Navigation from '$lib/troc/Navigation.svelte'
  import MobileNavigation from '$lib/troc/MobileNavigation.svelte'
  import { trocNavigationActive, isMobile } from '$lib/store/layout'

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

  <div class="pa-4 pb-16" style="width: 100%;">
    <slot />
  </div>

  {#if $isMobile}
    <MobileNavigation />
  {/if}
</div>

<style>
  .layout {
    transition: padding 0.3s;
  }
</style>
