<script lang="ts">
  import { params, metatags } from '@roxi/routify'

  import { useApi } from '$lib/api'
  import { trocs } from '$lib/troc/store'
  import Loader from '$lib/util/Loader.svelte'
  import TrocInfo from '$lib/troc/Info.svelte'
  import type { Troc } from 'types'

  $: trocQuery = useApi<{ trocId: string }, Troc>({
    queryKey: ['trocs/byId', { trocId: $params.trocId }],
  })

  // Nécéssaire pour mettre à jour le point sur la map
  $: $trocs = $trocQuery.data ? [$trocQuery.data] : []

  $: metatags.title = `Trocio ⋅ ${$trocs[0]?.name}` || 'Trocio'
</script>

{#if $trocQuery.isLoading}
  <Loader />
{:else if $trocQuery.isError}
  <span>Aucun troc ne correspond à l'ID "{$params.trocId}"</span>
  <br />
  <a href="/trocs">Retour</a>
{:else}
  <div class="pa-4" style="max-width: 1000px; margin: auto;">
    <TrocInfo troc={$trocs[0]} />
  </div>
{/if}
