<script lang="ts">
  import { onMount } from 'svelte'
  import { goto, page } from '@roxi/routify'

  import { user } from '$lib/user/store'
  import SubTrocsList from '$lib/sub/TrocsList.svelte'

  onMount(() => {
    if (!$user) $goto(`/login?callback=${$page.path}`)
  })
</script>

<div class="pa-4">
  <SubTrocsList />
</div>
