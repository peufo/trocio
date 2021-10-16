<script lang="ts">
  import { slide, fade } from 'svelte/transition'
  import { createEventDispatcher } from 'svelte'
  const dispatch = createEventDispatcher()
  import { afterPageLoad } from '@roxi/routify'
  import { Button, TextField, Icon } from 'svelte-materialify'

  import { isDarkTheme } from '$lib/store/layout'
  import { user, userQuery } from '$lib/user/store'
  import notify from '$lib/notify'
  import RULES from '$lib/rules'

  // TODO: Gestion des création d'utilisateur par un caissier

  export let mailInput: HTMLInputElement = null // For focus

  let state = 1
  const LOGIN = 1
  const REGISTER = 2
  const RECOVER = 3

  let name = ''
  let mail = ''
  let password = ''
  let password2 = ''
  const RULE_NEW_PASSWORD2 = [
    () => password !== password2 && 'Mot de passe de confirmation différent',
  ]

  let error = ''
  function checkForm() {
    error = checkRules(RULES.MAIL, mail)
    if (!error && state === REGISTER)
      error =
        checkRules(RULES.NAME, name) ||
        checkRules(RULES.NEW_PASSWORD, password) ||
        checkRules(RULE_NEW_PASSWORD2)
  }
  function checkRules(rules, value = undefined) {
    return rules.map((r) => r(value)).filter((r) => typeof r === 'string')[0]
  }
  $: state && checkForm()

  const GOOGLE_AUTH_API_PARAMS = new URLSearchParams({
    scope: 'email profile',
    access_type: 'online',
    response_type: 'code',
    redirect_uri: `${location.origin}/api/users/login-with-google`,
    client_id: String(import.meta.env.VITE_TROCIO_GOOGLE_CLIENT_ID),
  })

  const GOOGLE_AUTH_API_URL = `https://accounts.google.com/o/oauth2/v2/auth`
  const getGoogleAuthApi = () =>
    `${GOOGLE_AUTH_API_URL}?${GOOGLE_AUTH_API_PARAMS.toString()}&state=${
      location.href
    }`
  let googleAuthApi = getGoogleAuthApi()
  $afterPageLoad(() => (googleAuthApi = getGoogleAuthApi()))

  function submit() {
    if (error) return notify.warning(error)

    switch (state) {
      case LOGIN:
        userQuery.login(mail, password).then(() => {
          dispatch('close')
          dispatch('done')
        })
        break

      case REGISTER:
        userQuery.register(name, mail, password).then(() => {
          dispatch('close')
          dispatch('done')
        })
        break

      case RECOVER:
        userQuery.recover(mail).then(() => {
          state = LOGIN
        })
        break
    }
  }

  let innerWidth
</script>

<svelte:window bind:innerWidth />

<div style={`width: ${innerWidth > 500 ? '360px' : 'auto'}`}>
  {#if state === REGISTER}
    <h5 class="w3-center" in:fade>Nouveau compte</h5>
  {:else if state === RECOVER}
    <h5 class="w3-center" in:fade>Oubli</h5>
  {:else if state === LOGIN}
    <h5 class="w3-center" in:fade>Login</h5>
  {/if}

  <br />

  {#if state === REGISTER}
    <div transition:slide|local>
      <TextField
        placeholder="Nom & prénom"
        solo
        bind:value={name}
        on:input={checkForm}
        on:keyup={(e) => e.key == 'Enter' && submit()}
      >
        <div slot="prepend">
          <Icon class="far fa-user" />
        </div>
      </TextField>
      <br />
    </div>
  {/if}

  <TextField
    placeholder="Email"
    solo
    bind:inputElement={mailInput}
    bind:value={mail}
    on:input={checkForm}
    on:keyup={(e) => e.key == 'Enter' && submit()}
  >
    <div slot="prepend">
      <Icon class="far fa-envelope" />
    </div>
  </TextField>

  <br />

  {#if state === LOGIN || state === REGISTER}
    <div transition:slide|local>
      <TextField
        placeholder="Mot de passe"
        solo
        type="password"
        bind:value={password}
        on:input={checkForm}
        on:keyup={(e) => e.key === 'Enter' && submit()}
      >
        <div slot="prepend">
          <Icon class="fas fa-key" />
        </div>
      </TextField>
    </div>
  {/if}

  {#if state === REGISTER}
    <div transition:slide|local>
      <TextField
        placeholder="Pour être sûr :)"
        solo
        type="password"
        bind:value={password2}
        on:input={checkForm}
        on:keyup={(e) => e.key == 'Enter' && submit()}
      >
        <div slot="prepend">
          <Icon class="fas fa-key" />
        </div>
      </TextField>
    </div>
  {/if}

  <div>
    <div class="w3-margin-top w3-small w3-center">
      {#if state !== REGISTER}
        <div
          on:click={() => (state = REGISTER)}
          class="underline-div w3-padding"
        >
          <span class="underline-span">Nouveau compte</span>
        </div>
      {/if}

      {#if state !== RECOVER}
        <div
          on:click={() => (state = RECOVER)}
          class="underline-div w3-padding"
        >
          <span class="underline-span">Oubli</span>
        </div>
      {/if}

      {#if state !== LOGIN}
        <div on:click={() => (state = LOGIN)} class="underline-div w3-padding">
          <span class="underline-span">Login</span>
        </div>
      {/if}

      {#await $userQuery}
        <Button text disabled>
          <i class="fas fa-circle-notch w3-spin" />
        </Button>
      {:then}
        <Button text on:click={submit}>Envoyer</Button>
      {:catch}
        <Button text on:click={submit}>Envoyer</Button>
      {/await}
    </div>
  </div>

  {#if !$user}
    <br /><br />
    <div class="w3-center w3-border-top">
      <div class="or {$isDarkTheme ? 'grey darken-4' : ''}">
        <span>OU</span>
      </div>
      <a href={googleAuthApi}>
        <Button text>
          <i class="fab fa-google" />&nbsp; Login avec Google
        </Button>
      </a>
    </div>
  {/if}
</div>

<style>
  .or {
    transform: translateY(-50%);
    background: #fff;
    width: 35px;
    margin: auto;
    padding: 5px;
  }

  .underline-span {
    text-transform: uppercase;
  }

  .underline-div {
    display: inline-block;
  }
</style>
