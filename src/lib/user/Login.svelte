<script lang="ts">
  import { slide, fade } from 'svelte/transition'
  import { createEventDispatcher } from 'svelte'
  const dispatch = createEventDispatcher()
  import { afterPageLoad } from '@roxi/routify'
  import { Button, TextField, Icon, Divider } from '$material'

  import { isDarkTheme } from '$lib/store/layout'
  import { userQuery } from '$lib/user/store'
  import notify from '$lib/notify'
  import RULES from '$lib/rules'

  let mailInput: Element | undefined = undefined

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
  let innerWidth: number

  function checkForm() {
    error = checkRules(RULES.MAIL, mail)
    if (!error && state === REGISTER)
      error =
        checkRules(RULES.NAME, name) ||
        checkRules(RULES.NEW_PASSWORD, password) ||
        checkRules(RULE_NEW_PASSWORD2)
  }
  function checkRules(rules: ((v: string) => any)[], value = '') {
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
</script>

<svelte:window bind:innerWidth />

<form on:submit|preventDefault={submit}>
  {#if state === REGISTER}
    <h5 class="text-center" in:fade>Nouveau compte</h5>
  {:else if state === RECOVER}
    <h5 class="text-center" in:fade>Oubli</h5>
  {:else if state === LOGIN}
    <h5 class="text-center" in:fade>Login</h5>
  {/if}

  <br />

  {#if state === REGISTER}
    <div transition:slide|local>
      <TextField
        placeholder="Nom & prénom"
        solo
        bind:value={name}
        on:input={checkForm}
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
      >
        <div slot="prepend">
          <Icon class="fas fa-key" />
        </div>
      </TextField>
    </div>
  {/if}

  <div class="d-flex mt-4">
    {#if state !== REGISTER}
      <Button on:click={() => (state = REGISTER)} text>Nouveau</Button>
    {/if}

    {#if state !== RECOVER}
      <Button on:click={() => (state = RECOVER)} text>Oubli</Button>
    {/if}

    {#if state !== LOGIN}
      <Button on:click={() => (state = LOGIN)} text>login</Button>
    {/if}

    <div class="flex-grow-1" />

    {#await $userQuery}
      <Button disabled>
        <Icon class="fas fa-circle-notch" spin />
      </Button>
    {:then}
      <Button type="submit">Envoyer</Button>
    {:catch}
      <Button type="submit">Envoyer</Button>
    {/await}
  </div>

  <br />
  <Divider />
  <div class="text-center">
    <div class="or">
      <span>ou</span>
    </div>
    <a href={googleAuthApi}>
      <Button text>
        <i class="fab fa-google" />&nbsp; Login avec Google
      </Button>
    </a>
  </div>
</form>

<style>
  form {
    min-width: 320px;
  }

  .or {
    transform: translateY(-50%);
    background: var(--theme-cards);
    width: 35px;
    margin: auto;
    padding: 5px;
  }
</style>
