<script lang="ts">
  import { Button, Icon } from "$lib/material";
  import { faUser } from "@fortawesome/free-regular-svg-icons";
  import { mdiWeatherNight, mdiWhiteBalanceSunny } from "@mdi/js";

  import { user } from "$lib/user/store";
  import logo from "$lib/assets/logo";
  import { isDarkTheme } from "$lib/store/layout";
  import IconLink from "$lib/util/IconLink.svelte";
  import { afterNavigate } from "$app/navigation";

  let profilUrl = $user ? "/profile" : `/login`;
  afterNavigate(() => {
    profilUrl = $user ? "/profile" : `/login?callback=${location.pathname}`;
  });
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
