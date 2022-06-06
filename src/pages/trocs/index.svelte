<script>
  import { Card } from 'svelte-materialify'

  import { isMobile } from '$lib/store/layout'
  import TrocMap from '$lib/troc/Map.svelte'
  import TrocSearch from '$lib/troc/Search.svelte'
  import TrocResult from '$lib/troc/Result.svelte'
</script>

{#if $isMobile}
  <Card class="mb-3">
    <TrocSearch />
    <TrocMap />
  </Card>
{/if}

<TrocResult />
