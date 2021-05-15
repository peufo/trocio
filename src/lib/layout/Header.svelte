<script lang="ts">
  import { AppBar, Button, Dialog } from 'svelte-materialify'
  import { onMount } from 'svelte'
  // TODO: User Terme dialog
  import { troc } from '$lib/stores'
  import { user } from '$lib/store/user'

  import Login from '$lib/form/Login.svelte'
  import notify from '$lib/notify'
  import { getHeader } from '$lib/utils'

  import logo from '$assets/favicon.ico'

  export let offsetHeight
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

<div bind:offsetHeight>
  <AppBar dense flat class="grey darken-2 theme--dark">
    <div slot="title">
      <img src={logo} alt="logo Trocio" height="35" />
      <a href="/" class="white-text">
        TROCIO {$troc ? ` - ${$troc.name}` : ''}
      </a>
    </div>

    <div style="flex-grow: 1;" />

    {#if $user}
      <div>
        <a href="/activity">
          <Button text>
            <i class="fas fa-bars w3-large" />
            <span class="button-label">&nbsp;Mes trocs</span>
          </Button>
        </a>

        <a href="/profile">
          <Button text>
            <i class="fas fa-user w3-large" />
            <span class="button-label">&nbsp;{$user.name}</span>
          </Button>
        </a>
      </div>
    {:else}
      <Button on:click={() => (dialogLoginIsActive = true)} text>
        <i class="far fa-user w3-large" />
        <span class="button-label">&nbsp;Connexion</span>
      </Button>
    {/if}
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
<style>
  @media screen and (max-width: 500px) {
    .button-label {
      display: none;
    }
  }
</style>