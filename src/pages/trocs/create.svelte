<script>
  import { onMount } from 'svelte'
  import { redirect, page } from '@roxi/routify'
  import { Icon } from 'svelte-materialify'
  import { mdiAlert } from '@mdi/js'

  import { user } from '$lib/user/store'
  import TrocEdit from '$lib/troc/Edit.svelte'
  onMount(() => {
    if (!$user) $redirect(`/login?callback=${$page.path}`)
  })
</script>

{#if !!$user}
  <div class="pa-2">
    <div class="orange white-text alert mb-4">
      <Icon path={mdiAlert} class="mr-4" />

      La création d'un troc est une fonctionnalité réservée aux testeurs.
      Contactez-nous si vous souhaitez participer à la beta.
    </div>
    <TrocEdit createMode />
  </div>
{/if}
