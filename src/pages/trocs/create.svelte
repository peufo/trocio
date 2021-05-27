<script>
  import { goto } from '@roxi/routify'
  import TrocEdit from '$lib/troc/Edit.svelte'

  function createTroc(e) {
    let troc = e.detail
    $goto(`/admin?troc=${troc._id}`)
  }
</script>

<TrocEdit on:create={createTroc} />
