<script>
  import { goto } from '@roxi/routify'
  import TrocEdit from '$lib/troc/Edit.svelte'
  import { trocNavigationActive } from '$lib/store/layout'

  $trocNavigationActive = false

  function createTroc(e) {
    let troc = e.detail
    $goto(`/admin?troc=${troc._id}`)
  }
</script>

<TrocEdit on:create={createTroc} />
