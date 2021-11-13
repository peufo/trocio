<script lang="ts">
  import { params } from '@roxi/routify'
  import { Alert } from 'svelte-materialify'

  import Loader from '$lib/util/Loader.svelte'
  import CashRegister from '$lib/cash/CashRegister.svelte'
  import Tips from '$lib/layout/Tips.svelte'
  import { troc } from '$lib/troc/store'
  import { useApi } from '$lib/api'
  import type { TrocLookup } from 'types'
  import IconLink from '$lib/util/IconLink.svelte'
  import { faQuestionCircle } from '@fortawesome/free-regular-svg-icons'

  export let tipsActive = false
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
  <Tips bind:width={tipsWidth} bind:active={tipsActive} />
  <!--
      <div
        class="tipsButton pl-2 pa-1"
        class:tipsActive
        on:click={() => (tipsActive = true)}
      >
        <IconLink clickable icon={faQuestionCircle} size="1.1em" />
      </div>
  -->

  <div class="layout" style="padding-right: {tipsActive ? tipsWidth : '0px'};">
    <main class="pa-4">
      {#if $trocQuery?.data?.is_try}
        <Alert visible class="orange white-text">Troc d'entrainement</Alert>
      {/if}

      <CashRegister />
    </main>
  </div>
{/if}

<style>
  .layout {
    transition: padding 200ms;
  }

  .tipsButton.tipsActive {
    transform: translateX(-50px);
  }

  .tipsButton {
    position: absolute;
    bottom: 10px;
    left: 0px;
    transition: transform 200ms;
    background: var(--theme-surface);
    border-top: solid 1px var(--theme-text-fields-border);
    border-right: solid 1px var(--theme-text-fields-border);
    border-bottom: solid 1px var(--theme-text-fields-border);
    border-radius: 0px 23px 23px 0px;
  }
</style>
