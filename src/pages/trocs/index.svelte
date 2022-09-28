<script>
  import { Card } from '$material'

  import { isMobile } from '$lib/store/layout'
  import TrocMap from '$lib/troc/Map.svelte'
  import TrocSearch from '$lib/troc/Search.svelte'
  import TrocResult from '$lib/troc/Result.svelte'
</script>

<div class="pa-4">
  {#if $isMobile}
    <Card class="mb-3">
      <TrocSearch />
      <TrocMap />
    </Card>
  {/if}

  <TrocResult />
</div>
