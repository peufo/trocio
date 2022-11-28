<script lang="ts">
  import { Button, Icon } from '$material'
  import { faUser } from '@fortawesome/free-regular-svg-icons'
  import { mdiWeatherNight, mdiWhiteBalanceSunny } from '@mdi/js'
  import { page, url, afterPageLoad } from '@roxi/routify'

  import { user } from '$lib/user/store'
  import logo from '$assets/logo'
  import { isDarkTheme } from '$lib/store/layout'
  import IconLink from '$lib/util/IconLink.svelte'

  let profilUrl = $user ? '/profile' : `/login`
  $afterPageLoad(() => {
    profilUrl = $user ? '/profile' : `/login?callback=${location.pathname}`
  })
</script>

<a href="/trocs">
  <Button fab depressed>
    <Icon {...logo} />
  </Button>
</a>

<a href={profilUrl}>
  <Button fab depressed>
    <IconLink icon={faUser} />
  </Button>
</a>

<Button fab depressed on:click={() => ($isDarkTheme = !$isDarkTheme)}>
  <Icon path={$isDarkTheme ? mdiWeatherNight : mdiWhiteBalanceSunny} />
</Button>
