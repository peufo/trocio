<script lang="ts">
  import { Button, Icon } from 'svelte-materialify'
  import { mdiArrowLeft } from '@mdi/js'

  import TrocMap from '$lib/troc/Map.svelte'
  import TrocSearch from '$lib/troc/Search.svelte'
</script>

<TrocSearch />
<TrocMap />

<Button
  fab
  on:click={() => window.history.back()}
  class="primary-color"
  style="position: fixed; bottom: 80px; right: 10px;"
>
  <Icon path={mdiArrowLeft} />
</Button>
