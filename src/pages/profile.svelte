<script>
    import { goto } from '@roxi/routify'
    
    import Profile from '$/Profile.svelte'
    import { user } from '$/stores.js'

</script>

{#if $user === null}
    {$goto('/')}
{:else if $user !== undefined}
    <Profile/>
{/if}
