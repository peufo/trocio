<script>
  import { redirect } from '@roxi/routify'

  import { user } from '$lib/store/user'
  import SearchTrocs from '$lib/searchTrocs/Layout.svelte'
</script>

{#if $user == null}
  <SearchTrocs />
{:else}
  {$redirect('/activity/search')}
{/if}
