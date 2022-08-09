<script>
  import { onMount } from 'svelte'
  import { goto, page } from '@roxi/routify'
  import { Alert, Icon } from 'svelte-materialify'
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
  <Alert class="orange white-text" dismissible>
    <div slot="icon">
      <Icon path={mdiAlert} />
    </div>
    La création d'un troc est une fonctionnalité réservée aux testeurs. Contactez-nous
    si vous souhaitez participer à la beta.
  </Alert>
  <div class="pa-2">
    <TrocEdit createMode />
  </div>
{/if}
