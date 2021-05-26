<script lang="ts">
  import layout from '$lib/store/layout'
  import TrocNavigation from '$lib/troc/Navigation.svelte'
  import { page } from '@roxi/routify'

  let offsetWidth = 500

  let navigationWidth = '360px'
</script>

<div
  class="layout"
  bind:offsetWidth
  style="padding-left: {!$page.meta.navigationClosed ? navigationWidth : '0px'}"
>
  <TrocNavigation
    active={!$page.meta.navigationClosed}
    width={navigationWidth}
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
