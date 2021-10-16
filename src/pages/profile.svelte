<!-- routify:options isFooterDisplay=true -->
<script>
  import { redirect } from '@roxi/routify'

  import Profile from '$lib/user/Profile.svelte'
  import { user } from '$lib/user/store'
</script>

{#if !$user}
  {$redirect('/login', { callback: '/profile' })}
{:else}
  <Profile />
{/if}
