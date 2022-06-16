<script lang="ts">
  import { onMount } from 'svelte'
  import { goto, page } from '@roxi/routify'

  import { user } from '$lib/user/store'
  import UserSubscribes from '$lib/troc/UserSubscribes.svelte'

  onMount(() => {
    if (!$user) $goto(`/login?callback=${$page.path}`)
  })
</script>

<UserSubscribes />
