<script lang="ts">
  import { Button, Icon } from 'svelte-materialify'
  import { faUser } from '@fortawesome/free-regular-svg-icons'
  import { mdiWeatherNight, mdiWhiteBalanceSunny } from '@mdi/js'
  import { page } from '@roxi/routify'

  import { user } from '$lib/user/store'
  import logo from '$assets/logo'
  import { isDarkTheme } from '$lib/store/layout'
  import IconLink from '$lib/util/IconLink.svelte'
</script>

<a href="/trocs">
  <Button fab depressed>
    <Icon {...logo} />
  </Button>
</a>

<a href={$user ? '/profile' : `/login?callback=${$page.path}`}>
  <Button fab depressed>
    <IconLink icon={faUser} />
  </Button>
</a>

<Button fab depressed on:click={() => ($isDarkTheme = !$isDarkTheme)}>
  <Icon path={$isDarkTheme ? mdiWeatherNight : mdiWhiteBalanceSunny} />
</Button>
