<script lang="ts">
  import { fly } from 'svelte/transition'

  import NavigationAdmin from '$lib/layout/NavigationAdmin.svelte'

  import Tips from '$lib/layout/Tips.svelte'
  // import { troc } from '$lib/stores.js'

  //export let scoped

  let isTry = false
  export let tipsActive = false

  let navigationWidth: string
  let tipsWidth: string

  $: console.log(navigationWidth)
</script>

<NavigationAdmin
  bind:realWidth={navigationWidth}
  on:openTips={() => (tipsActive = !tipsActive)}
/>
<Tips bind:width={tipsWidth} bind:active={tipsActive} />

<div
  class="layout"
  style="
  padding-left: {navigationWidth};
  padding-right: {tipsActive ? tipsWidth : '0px'};"
>
  <main>
    <slot />

    {#if isTry}
      <div
        transition:fly={{ y: 40, delay: 500, duration: 800 }}
        class="try-bannear"
      >
        <b>Troc d'entrainement</b>
      </div>
    {/if}
  </main>
</div>

<style>
  .layout {
    transition: padding 200ms;
  }
</style>
