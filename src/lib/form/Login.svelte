<script lang="ts">
  import { slide, fade } from 'svelte/transition'
  import { createEventDispatcher } from 'svelte'
  const dispatch = createEventDispatcher()
  import { afterPageLoad } from '@roxi/routify'
  import { Button, TextField, Icon } from 'svelte-materialify'

  import { getHeader } from '$lib/utils'
  import { user, isDarkTheme } from '$lib/stores'
  import { userQuery } from '$lib/store/user'
  import notify from '$lib/notify'
  import RULES from '$lib/rules'

  //TODO: Gestion des création d'utilisateur par un caissier

  export let mailInput // For focus

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

  let submitPromise

  let error = ''
  function checkForm() {
    error = checkRules(RULES.MAIL, mail)
    if (!error && state === REGISTER)
      error =
        checkRules(RULES.NAME, name) ||
        checkRules(RULES.NEW_PASSWORD, password) ||
        checkRules(RULE_NEW_PASSWORD2)
  }
  function checkRules(rules, value) {
    return rules.map((r) => r(value)).filter((r) => typeof r === 'string')[0]
  }
  $: state && checkForm()

  const googleAuthApiParams = new URLSearchParams({
    scope: 'email profile',
    access_type: 'online',
    response_type: 'code',
    redirect_uri: `${location.origin}/api/users/login-with-google`,
    client_id: '__GOOGLE_CLIENT_ID__',
  })
  let googleAuthApi = `https://accounts.google.com/o/oauth2/v2/auth?${googleAuthApiParams.toString()}&state=${
    location.href
  }`
  $afterPageLoad(() => {
    googleAuthApi = `https://accounts.google.com/o/oauth2/v2/auth?${googleAuthApiParams.toString()}&state=${
      location.href
    }`
  })

  function submit() {
    if (error) return notify.warning(error)
    if (state === LOGIN)
      userQuery.login(mail, password).then(() => {
        dispatch('close')
        dispatch('done')
      })
    if (state === REGISTER) submitPromise = Register()
    if (state === RECOVER) submitPromise = Recover()
  }

  async function Register() {
    try {
      let res = await fetch('/api/users', getHeader({ name, mail, password }))
      let json = await res.json()
      if (!json.success) throw json.message
      //TODO
      if ($user) {
        //Un Cassier à créer un utilisateur
        notify.warning(
          `Transmettez les information de compte à ${json.message.name}\n\nMail : ${json.message.mail}\nMot de passe : ${json.message.password}`
        )
        dispatch('newClient', json.message)
      } else {
        // await Login()
      }
    } catch (error) {
      notify.error(error)
    }
  }

  async function Recover() {
    try {
      let res = await fetch('/api/users/resetpwd', getHeader({ mail }))
      let json = await res.json()
      if (!res.ok) throw json.message
      notify.warning('Votre nouveau mot de passe vous à été envoyé par mail')
      reset = false
      password = ''
      password2 = ''
    } catch (error) {
      notify.error(error)
    }
  }
</script>

<div style="min-width: 340px;">
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
        on:keyup={(e) => e.key == 'Enter' && submit()}
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

  .iconInput {
    margin-top: 12px;
    width: 30px;
    color: #888;
  }

  .underline-div {
    display: inline-block;
  }
</style>
