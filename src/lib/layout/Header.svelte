<script lang="ts">
  import { AppBar, Button, Dialog, Icon } from "$lib/material";
  import { faUser } from "@fortawesome/free-regular-svg-icons";
  import { mdiWeatherNight, mdiWhiteBalanceSunny } from "@mdi/js";

  import { troc } from "$lib/troc/store";
  import { user } from "$lib/user/store";
  import { isDarkTheme, isMobile } from "$lib/store/layout";

  import MobileMenu from "$lib/layout/MobileMenu.svelte";
  import logo from "$lib/assets/logo";
  import logoIco from "$lib/assets/favicon.ico";
  import IconLink from "$lib/util/IconLink.svelte";
  import Login from "$lib/user/Login.svelte";

  export let offsetHeight = 0;
  let offsetWidth = 0;
  $: $isMobile = offsetWidth < 900;

  let dialogLoginIsActive = false;
</script>

<svelte:head>
  <title>
    Trocio {$troc ? ` - ${$troc.name}` : ""}
  </title>
</svelte:head>

<div bind:offsetHeight bind:offsetWidth>
  <AppBar flat>
    <div slot="icon">
      <img
        src={logoIco}
        alt="logo Trocio"
        height="40"
        style="transform: translate(5px, 2px);"
      />
    </div>

    <div slot="title" class="pl-0">
      <a href="/" class="title">Troc.io</a>
    </div>

    <div style="flex-grow: 1;"></div>

    {#if $isMobile}
      <MobileMenu />
    {:else}
      <a href="/trocs">
        <Button text>
          <Icon {...logo} class="mr-2" />
          Les trocs
        </Button>
      </a>

      {#if $user}
        <a href="/profile">
          <Button text>
            <IconLink icon={faUser} class="mr-2" />
            {$user.name}
          </Button>
        </a>
      {:else}
        <Button on:click={() => (dialogLoginIsActive = true)} text class="mr-1">
          <IconLink icon={faUser} />
          Connexion
        </Button>
      {/if}

      <Button text fab on:click={() => ($isDarkTheme = !$isDarkTheme)}>
        <Icon path={$isDarkTheme ? mdiWeatherNight : mdiWhiteBalanceSunny} />
      </Button>
    {/if}
  </AppBar>
</div>

<Dialog
  bind:active={dialogLoginIsActive}
  class="pa-6"
  style="background: var(--theme-cards);"
>
  <div class="d-flex justify-center">
    <Login on:close={() => (dialogLoginIsActive = false)} />
  </div>
</Dialog>

<style>
  .title {
    color: var(--theme-text-primary);
    font-family: Dongle;
    font-size: 2em;
  }
</style>
