<script lang="ts">
  import { AppBar, Button, Dialog, Icon } from 'svelte-materialify'
  import { faUser, faMoon } from '@fortawesome/free-regular-svg-icons'
  import { faSun } from '@fortawesome/free-solid-svg-icons'

  // TODO: User Terme dialog
  import { troc } from '$lib/stores'
  import { user } from '$lib/user/store'
  import { trocNavigationActive, isDarkTheme } from '$lib/store/layout'

  import logo from '$assets/logo'
  import logoIco from '$assets/favicon.ico'
  import IconLink from '$lib/util/IconLink.svelte'
  import Login from '$lib/form/Login.svelte'
  import notify from '$lib/notify'
  import { getHeader } from '$lib/utils'

  export let offsetHeight
  let offsetWidth = 0
  $: mobileMode = offsetWidth < 540

  let dialogLoginIsActive
  //let dialogAcceptTerms
  let mailInput

  //$: if (!!$user && !$user.acceptTerms && !!dialogAcceptTerms.open) dialogAcceptTerms.open()

  async function acceptTerms() {
    try {
      let res = await fetch(
        '/api/users/me',
        getHeader({ acceptTerms: true }, 'PATCH')
      )
      let json = await res.json()
      if (json.error) return notify.error(json.message)
      //$user.acceptTerms = true
      notify.success({
        title: 'Merci et bienvenue !',
        text: `Vous avez accepté nos conditions d'utilisations`,
      })
    } catch (error) {
      notify.error(error)
    }
  }
</script>

<svelte:head>
  <title>
    Trocio {$troc ? ` - ${$troc.name}` : ''}
  </title>
</svelte:head>

<div bind:offsetHeight bind:offsetWidth>
  <AppBar flat>
    <img slot="icon" src={logoIco} alt="logo Trocio" height="35" class="ml-2" />
    <div slot="title">
      <a href="/" style="color: var(--theme-text-primary);">
        TROCIO {$troc ? ` - ${$troc.name}` : ''}
      </a>
    </div>

    <div style="flex-grow: 1;" />

    <a href="/trocs">
      <Button
        text
        fab={mobileMode}
        on:click={() => ($trocNavigationActive = true)}
      >
        <Icon {...logo} />
        {#if !mobileMode}&nbsp;&nbsp;Les trocs{/if}
      </Button>
    </a>

    {#if $user}
      <a href="/profile">
        <Button text fab={mobileMode}>
          <IconLink icon={faUser} />
          {#if !mobileMode}&nbsp;&nbsp;{$user.name}{/if}
        </Button>
      </a>
    {:else}
      <Button
        on:click={() => (dialogLoginIsActive = true)}
        text
        fab={mobileMode}
        class="mr-1"
      >
        <IconLink icon={faUser} />
        {#if !mobileMode}&nbsp;&nbsp;Connexion{/if}
      </Button>
    {/if}

    <Button text fab on:click={() => ($isDarkTheme = !$isDarkTheme)}>
      <IconLink icon={$isDarkTheme ? faSun : faMoon} />
    </Button>
  </AppBar>
</div>

<Dialog
  bind:active={dialogLoginIsActive}
  on:introend={() => mailInput && mailInput.focus()}
  class="pa-6"
  width=""
>
  <Login on:close={() => (dialogLoginIsActive = false)} bind:mailInput />
</Dialog>

<!--
<Dialog bind:this={dialogAcceptTerms} escapeKeyAction='' scrimClickAction=''>
	<TitleDialog>Conditions d'utilisation</TitleDialog>
	<Content>
		<TermsOfUse/>
	</Content>
	<Actions>
		<Button on:click={user.logout} color="secondary">
			Refuser
		</Button>
		<Button on:click={acceptTerms}>
			Accepter
		</Button>
	</Actions>
</Dialog>
-->
