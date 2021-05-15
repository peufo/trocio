<!-- routify:options isFooterDisplay=true -->
<script>
  import { redirect } from '@roxi/routify'

  import Profile from '$lib/form/Profile.svelte'
  import { user } from '$lib/store/user'
</script>

{#if !$user}
  {$redirect('/login', { callback: '/profile' })}
{:else}
  <Profile />
{/if}
