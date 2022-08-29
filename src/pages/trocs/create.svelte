<script>
  import { onMount } from 'svelte'
  import { goto, page } from '@roxi/routify'
  import { Icon } from 'svelte-materialify'
  import { mdiAlert } from '@mdi/js'

  import { user } from '$lib/user/store'
  import TrocEdit from '$lib/troc/Edit.svelte'
  onMount(() => {
    const url = `/login?callback=${$page.path}`
    console.log(url, $user)
    if (!$user) $goto(`/login?callback=${$page.path}`)
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
