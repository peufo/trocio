<script>
  import { params } from '@roxi/routify'
  import { Card } from 'svelte-materialify'

  import { useTroc, useTrocOptions, trocs } from '$lib/troc/store'
  import Loader from '$lib/util/Loader.svelte'
  import TrocInfo from '$lib/troc/Info.svelte'

  const trocQuery = useTroc($params.trocId)
  $: $params.trocId && trocQuery.setOptions(useTrocOptions($params.trocId))

  // TODO: not util ?
  $: $trocs = $trocQuery.data ? [$trocQuery.data] : []
</script>

{#if $trocQuery.isLoading}
  <Loader />
{:else}
  <div class="pa-4" style="max-width: 1000px; margin: auto;">
    <TrocInfo troc={$trocs[0]} />
  </div>
{/if}
