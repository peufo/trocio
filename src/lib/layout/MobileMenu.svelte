<script lang="ts">
  import { Button } from 'svelte-materialify'
  import { faSun, faMoon } from '@fortawesome/free-solid-svg-icons'
  import { faUser } from '@fortawesome/free-regular-svg-icons'
  import { page } from '@roxi/routify'

  import { user } from '$lib/user/store'
  import { isDarkTheme } from '$lib/store/layout'
  import IconLink from '$lib/util/IconLink.svelte'
</script>

{#if $user}
  <a href="/profile">
    <Button fab depressed class="mr-2">
      <IconLink icon={faUser} />
    </Button>
  </a>
{:else}
  <a href={`/login?callback=${$page.path}`}>
    <Button fab depressed class="mr-2">
      <IconLink icon={faUser} />
    </Button>
  </a>
{/if}

<Button fab depressed on:click={() => ($isDarkTheme = !$isDarkTheme)}>
  <IconLink icon={$isDarkTheme ? faMoon : faSun} />
</Button>
