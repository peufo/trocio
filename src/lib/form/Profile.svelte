<script>
  import { slide, fade } from 'svelte/transition'
  import { Button, TextField, Icon, Card } from 'svelte-materialify'
  import { user, userQuery, userStatus } from '$lib/store/user'

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
        <div transition:slide|local>
          <Button
            on:click={() => userQuery.update({ name: userName })}
            disabled={userNameError || $userStatus.isLoading}
            class="w3-right"
          >
            {#await $userQuery}
              <i class="fas fa-circle-notch w3-spin" />
              &nbsp;Validation ...
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
        <div transition:slide|local>
          <Button
            on:click={() => userQuery.update({ mail: userMail })}
            disabled={userMailError || $userStatus.isLoading}
            class="w3-right"
          >
            {#await $userQuery}
              <i class="fas fa-circle-notch w3-spin" />
              &nbsp;Validation ...
            {:then}
              Valider la modification
            {/await}
          </Button>
          <br /><br />
        </div>
      {/if}
      <br />

      {#if !$user.mailvalided}
        {#if mailValidationSent}
          <span> Un mail de validation vous à été envoyé. </span>
        {:else}
          {#await sendValidationMailPromise}
            <Button text disabled class="w3-right">
              <i class="fas fa-circle-notch w3-spin" />&nbsp;Envoie du mail ...
            </Button>
          {:then}
            <div
              class="w3-text-red w3-left"
              style="transform: translateY(6px);"
            >
              <i class="fas fa-exclamation-triangle" />
              mail non validé
            </div>

            <Button text on:click={handleSendValidationMail} class="w3-right">
              Envoyer un mail de validation ?
            </Button>
          {/await}
        {/if}
      {/if}

      <br /><br /><br />

      {#if !changePassword}
        <div out:slide|local>
          <Button
            on:click={() => (changePassword = true)}
            text
            color="secondary"
            class="w3-margin-top w3-right"
          >
            Changer votre mot de passe ?
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

          <br />
          {#await changePasswordPromise}
            <Button text disabled class="w3-right">
              <i class="fas fa-circle-notch w3-spin" />&nbsp;Modification du mot
              de passe...
            </Button>
          {:then}
            <Button
              variant="raised"
              on:click={handleChangePassword}
              disabled={!newPassword || newPasswordError || newPassword2Error}
              class="w3-margin-top w3-right"
            >
              Valider la modification
            </Button>
          {:catch}
            <Button
              variant="raised"
              on:click={handleChangePassword}
              disabled={!newPassword || newPasswordError || newPassword2Error}
              class="w3-margin-top w3-right"
            >
              Valider la modification
            </Button>
          {/await}

          <br />
        </div>
      {/if}
      <br /><br /><br />

      <Button
        on:click={userQuery.logout}
        color="secondary"
        class="w3-margin-top w3-right"
      >
        Déconnexion
      </Button>

      <br /><br /><br />
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
