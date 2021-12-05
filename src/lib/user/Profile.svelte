<script>
  import { slide } from 'svelte/transition'
  import { Button, TextField, Icon, Card } from 'svelte-materialify'

  import Loader from '$lib/util/Loader.svelte'
  import { user, userQuery, userStatus } from '$lib/user/store'

  import RULES from '$lib/rules'

  let userName = $user?.name
  let userNameError = false

  let userMail = $user?.mail
  let sendValidationMailPromise
  let mailValidationSent = false
  let userMailError = false

  let changePasswordPromise
  let changePassword = false
  let oldPassword = ''
  let newPassword = ''
  let newPasswordError = false
  let newPassword2 = ''
  let newPassword2Error = false
  const RULE_NEW_PASSWORD = [
    () => newPassword !== newPassword2 && 'Pas identique',
  ]

  function handleSendValidationMail() {
    sendValidationMailPromise = userQuery
      .sendValidationMail()
      .then(() => (mailValidationSent = true))
  }

  function handleChangePassword() {
    changePasswordPromise = userQuery
      .changePassword(oldPassword, newPassword)
      .then(() => {
        changePassword = false
        oldPassword = ''
        newPassword = ''
        newPassword2 = ''
      })
      .catch(() => {})
  }
</script>

{#if $user}
  <br />
  <Card class="pa-8" style="max-width: 850px; margin: auto;">
    <div style="max-width: 500px; margin: auto;">
      <br /><br />

      <TextField
        bind:value={userName}
        rules={RULES.NAME}
        bind:error={userNameError}
      >
        <div slot="prepend">
          <Icon class="far fa-user" />
        </div>
        Nom & Prénom
      </TextField>

      {#if userName !== $user.name}
        <div transition:slide|local class="d-flex">
          <div class="flex-grow-1" />
          <Button
            on:click={() => userQuery.update({ name: userName })}
            disabled={userNameError || $userStatus.isLoading}
          >
            {#await $userQuery}
              <Loader />
            {:then}
              Valider la modification
            {/await}
          </Button>
          <br /><br />
        </div>
      {/if}

      <br /><br /><br />

      <TextField
        bind:value={userMail}
        rules={RULES.MAIL}
        bind:error={userMailError}
      >
        <div slot="prepend">
          <Icon class="far fa-envelope" />
        </div>
        Mail
      </TextField>

      {#if userMail !== $user.mail}
        <div transition:slide|local class="d-flex">
          <div class="flex-grow-1" />
          <Button
            on:click={() => userQuery.update({ mail: userMail })}
            disabled={userMailError || $userStatus.isLoading}
          >
            {#await $userQuery}
              <Loader />
            {:then}
              Valider la modification
            {/await}
          </Button>
          <br /><br />
        </div>
      {/if}

      {#if !$user.mailvalided}
        {#if mailValidationSent}
          <span> Un mail de validation vous à été envoyé. </span>
        {:else}
          <div class="d-flex">
            <div
              class="red-text text-caption"
              style="transform: translateY(6px);"
            >
              <i class="fas fa-exclamation-triangle" />
              mail non validé
            </div>

            <div class="flex-grow-1" />
            {#await sendValidationMailPromise}
              <Button text disabled>
                <Loader title="Envoie du mail" />
              </Button>
            {:then}
              <Button text on:click={handleSendValidationMail}>
                Envoyer un mail de validation
              </Button>
            {/await}
          </div>
        {/if}
      {/if}

      <br />

      {#if !changePassword}
        <div out:slide|local class="d-flex">
          <div class="flex-grow-1" />
          <Button on:click={() => (changePassword = true)} text>
            Changer votre mot de passe
          </Button>
          <br />
        </div>
      {:else}
        <div in:slide|local>
          <br />
          <TextField type="password" bind:value={oldPassword}>
            <div slot="prepend">
              <Icon class="fas fa-unlock" />
            </div>
            Mot de passe actuel
          </TextField>

          <br /><br />

          <TextField
            type="password"
            bind:value={newPassword}
            rules={RULES.NEW_PASSWORD}
            bind:error={newPasswordError}
          >
            <div slot="prepend">
              <Icon class="fas fa-key" />
            </div>
            Nouveau mot de passe
          </TextField>

          <br />

          <TextField
            type="password"
            bind:value={newPassword2}
            rules={RULE_NEW_PASSWORD}
            bind:error={newPassword2Error}
          >
            <div slot="prepend">
              <Icon class="fas fa-key" />
            </div>
            Confirmation
          </TextField>

          <div class="d-flex">
            <div class="flex-grow-1" />
            {#await changePasswordPromise}
              <Button text disabled>
                <Loader title="Modification du mot de passe..." />
              </Button>
            {:then}
              <Button
                variant="raised"
                on:click={handleChangePassword}
                disabled={!newPassword || newPasswordError || newPassword2Error}
              >
                Valider la modification
              </Button>
            {:catch}
              <Button
                variant="raised"
                on:click={handleChangePassword}
                disabled={!newPassword || newPasswordError || newPassword2Error}
              >
                Valider la modification
              </Button>
            {/await}
          </div>
        </div>
      {/if}

      <br />

      <Button on:click={userQuery.logout} text class="red-text">
        Déconnexion
      </Button>

      <br />
    </div>
  </Card>

  <br />
{/if}

<svelte:head>
  <style>
    #waitLoaded {
      display: none;
    }
  </style>
</svelte:head>
