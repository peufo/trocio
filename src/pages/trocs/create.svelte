<script>
  import { onMount } from 'svelte'
  import { redirect, page } from '@roxi/routify'

  import { user } from '$lib/user/store'
  import TrocEdit from '$lib/troc/Edit.svelte'
  onMount(() => {
    if (!$user) $redirect(`/login?callback=${$page.path}`)
  })
</script>

{#if !!$user}
  <div class="pa-2">
    <TrocEdit createMode />
  </div>
{/if}
