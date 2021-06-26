<script>
  import { params } from '@roxi/routify'

  import TrocEdit from '$lib/troc/Edit.svelte'
  import Collaborators from '$lib/user/Collaborators.svelte'
</script>

{#if $params.tab_admin === 'info'}
  <TrocEdit />
{:else if $params.tab_admin === 'collab'}
  <Collaborators />
{:else}
  <TrocEdit />
{/if}
