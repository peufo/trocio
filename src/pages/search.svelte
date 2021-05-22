<script>
  import { redirect } from '@roxi/routify'

  import { user } from '$lib/store/user'
  import SearchTrocs from '$lib/troc/Layout.svelte'
</script>

{#if $user == null}
  <SearchTrocs />
{:else}
  {$redirect('/activity/search')}
{/if}
