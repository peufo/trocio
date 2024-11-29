<script lang="ts">
  import { fly } from 'svelte/transition'
  import { params, metatags } from '@roxi/routify'

  import { isMobile, isKeyboardOpen } from '$lib/store/layout'
  import { troc, trocs } from '$lib/troc/store'
  import Loader from '$lib/util/Loader.svelte'
  import TabsTroc from '$lib/troc/TabsTroc.svelte'
  import type { TrocLookup } from 'types'
  import { useApi } from '$lib/api'
  $: trocQuery = useApi<{ trocId: string }, TrocLookup>({
    queryKey: ['trocs/byId', { trocId: $params.trocId }],
  })

  // Nécéssaire pour mettre à jour le point sur la map
  $: $trocs = $trocQuery.data ? [$trocQuery.data] : []
  $: $troc = $trocs[0]
  $: metatags.title = `Trocio ⋅ ${$trocs[0]?.name}` || 'Trocio'
</script>

{#if $trocQuery.isLoading}
  <div class="centered" style="height: 85vh;">
    <Loader />
  </div>
{:else if $trocQuery.isError}
  <div class="centered" style="height: 85vh;">
    <div>
      <p>Aucun troc ne correspond à l'ID "{$params.trocId}"</p>
      <a href="/trocs">Retour</a>
    </div>
  </div>
{:else}
  <slot />
{/if}

{#if $isMobile && !$isKeyboardOpen}
  <nav out:fly|local={{ y: 72 }}>
    <TabsTroc />
  </nav>
{/if}

<style>
  nav {
    position: fixed;
    bottom: 0;
    width: 100%;
    height: 72px;
  }
</style>
