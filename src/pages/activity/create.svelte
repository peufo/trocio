<script>
  import { goto } from '@roxi/routify'
  import TrocEdit from '$lib/troc/Edit.svelte'

  function createTroc(e) {
    let troc = e.detail
    $goto(`/admin?troc=${troc._id}`)
  }
</script>

<h4>Organiser un troc</h4>

<TrocEdit mapDelay="250" on:create={createTroc} />
