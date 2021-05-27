<script lang="ts">
  import { Overlay } from 'svelte-materialify'
  import { afterPageLoad, isActive } from '@roxi/routify'

  import TrocNavigation from '$lib/troc/Navigation.svelte'
  import { trocNavigationActive } from '$lib/store/layout'

  let offsetWidth
  let navigationWidth = '360px'

  $: mobileMode = offsetWidth < 1000
  $: $trocNavigationActive = !mobileMode
  $: overlayActive = $trocNavigationActive && mobileMode
  $afterPageLoad(() => {
    // Hide navigation for create form
    if ($isActive('./create')) $trocNavigationActive = false
    else if (!mobileMode) $trocNavigationActive = true
    else if ($isActive('./index')) $trocNavigationActive = true
  })
</script>

<div
  class="layout"
  bind:offsetWidth
  style="padding-left: {$trocNavigationActive && !mobileMode
    ? navigationWidth
    : '0px'}"
>
  <TrocNavigation
    bind:active={$trocNavigationActive}
    width={navigationWidth}
    {mobileMode}
  />

  <Overlay
    index={2}
    active={overlayActive}
    on:click={() => ($trocNavigationActive = false)}
  />

  <div class="pa-4" style="width: 100%;">
    <slot />
  </div>
</div>

<style>
  .layout {
    transition: padding 0.3s;
  }
</style>
