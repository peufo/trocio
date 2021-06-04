<script>
  import { params } from '@roxi/routify'

  import TrocEdit from '$lib/troc/Edit.svelte'
  import Collaborators from '$lib/user/Collaborators.svelte'

  let components = {
    info: TrocEdit,
    collab: Collaborators,
    tarif: TrocEdit,
    tag: TrocEdit,
    statistic: TrocEdit,
    managment: TrocEdit,
    cashier: TrocEdit,
  }
</script>

<svelte:component this={components[$params.tab_admin] || components[0]} />
