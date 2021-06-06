<script lang="ts">
  import { fly } from 'svelte/transition'
  import { params } from '@roxi/routify'

  import Loader from '$lib/util/Loader.svelte'
  import NavigationAdmin from '$lib/layout/NavigationAdmin.svelte'
  import Tips from '$lib/layout/Tips.svelte'

  let isTry = false
  export let tipsActive = false

  let navigationWidth: string
  let tipsWidth: string

  import { useTroc, useTrocOptions } from '$lib/troc/store'
  const trocQuery = $params.trocId && useTroc($params.trocId)
  $: $params.trocId && trocQuery.setOptions(useTrocOptions($params.trocId))
</script>

{#if $trocQuery.isLoading}
  <div class="centered" style="height: 100px;">
    <Loader />
  </div>
{:else if $trocQuery.isError}
  <div class="centered" style="height: 100px;">
    <span>Oups, une erreur c'est produite.</span>
  </div>
{:else}
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
    <main class="pa-4">
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
{/if}

<style>
  .layout {
    transition: padding 200ms;
  }
</style>
