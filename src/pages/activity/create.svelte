<script>
  import { goto } from '@roxi/routify'
  import EditForm from '$lib/form/Troc.svelte'

  function createTroc(e) {
    let troc = e.detail
    $goto(`/admin?troc=${troc._id}`)
  }
</script>

<h4>Organiser un troc</h4>

<EditForm mapDelay="250" on:create={createTroc} />
