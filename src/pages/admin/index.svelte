<script>
  import { params } from '@roxi/routify'

  import TrocEdit from '$lib/troc/Edit.svelte'
  import Collaborators from '$lib/user/Collaborators.svelte'
  import Tarifs from '$lib/troc/Tarifs.svelte'
  import TarifsAttribution from '$lib/troc/TarifsAttribution.svelte'
</script>

{#if $params.tab_admin}
  {#if $params.tab_admin === 'info'}
    <TrocEdit />
  {:else if $params.tab_admin === 'collab'}
    <Collaborators />
  {:else if $params.tab_admin === 'tarif_edition'}
    <Tarifs />
  {:else if $params.tab_admin === 'tarif_attribution'}
    <TarifsAttribution />
  {:else}
    <TrocEdit />
  {/if}
{/if}
