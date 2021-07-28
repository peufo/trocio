<script>
  import { params } from '@roxi/routify'

  import TrocEdit from '$lib/troc/Edit.svelte'
  import Collaborators from '$lib/user/Collaborators.svelte'
  import Tarifs from '$lib/troc/Tarifs.svelte'
  import TarifsAttribution from '$lib/troc/TarifsAttribution.svelte'

  const tabs = {
    info: TrocEdit,
    collab: Collaborators,
    tarif_edition: Tarifs,
    tarif_attribution: TarifsAttribution,
  }
</script>

<svelte:component this={tabs[$params.tab_admin] || TrocEdit} />
