<script lang="ts">
  import { params } from '@roxi/routify'
  import { Alert } from 'svelte-materialify'

  import Loader from '$lib/util/Loader.svelte'
  import NavigationAdmin from '$lib/layout/NavigationAdmin.svelte'
  import Tips from '$lib/layout/Tips.svelte'
  import { troc } from '$lib/troc/store'
  import { useApi } from '$lib/api'
  import type { TrocLookup } from 'types'

  export let tipsActive = false
  let navigationWidth: string
  let tipsWidth: string

  const trocQuery = useApi<{ trocId: string }, TrocLookup>({
    queryKey: ['trocs/byId', { trocId: $params.trocId }],
    onSuccess: troc.set,
  })
</script>

{#if $trocQuery?.isLoading}
  <div class="centered" style="height: 100px;">
    <Loader />
  </div>
{:else if !$trocQuery || $trocQuery?.isError}
  <div class="centered" style="height: 100px;">
    <span>Oups, une erreur c'est produite.</span>
  </div>
{:else if $trocQuery.isSuccess}
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
      {#if $trocQuery?.data?.is_try}
        <Alert visible class="orange white-text">Troc d'entrainement</Alert>
      {/if}
      <slot />
    </main>
  </div>
{/if}

<style>
  .layout {
    transition: padding 200ms;
  }
</style>
