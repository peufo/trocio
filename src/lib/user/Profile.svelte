<script>
  import { slide } from 'svelte/transition'
  import { Button, TextField, Icon, Card } from 'svelte-materialify/src'

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
  <div class="container pa-2">
    <Card class="pa-8 pt-16">
      <div style="max-width: 500px; margin: auto;">
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
              class="primary-color"
            >
              {#await $userQuery}
                <Loader />
              {:then}
                Valider
              {/await}
            </Button>
            <br /><br />
          </div>
        {/if}

        <TextField
          class="mt-3"
          bind:value={userMail}
          rules={RULES.MAIL}
          bind:error={userMailError}
          hint={$user.mailvalided
            ? 'Mail validé'
            : mailValidationSent
            ? 'Un mail de validation vous à été envoyé.'
            : 'Mail non validé'}
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
              class="primary-color"
            >
              {#await $userQuery}
                <Loader />
              {:then}
                Valider
              {/await}
            </Button>
            <br /><br />
          </div>
        {/if}

        {#if !$user.mailvalided && !mailValidationSent}
          <div class="d-flex">
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
            <TextField type="password" bind:value={oldPassword}>
              <div slot="prepend">
                <Icon class="fas fa-unlock" />
              </div>
              Mot de passe actuel
            </TextField>

            <TextField
              class="mt-3"
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

            <TextField
              class="mt-3"
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
                  class="primary-color"
                  on:click={handleChangePassword}
                  disabled={!newPassword ||
                    newPasswordError ||
                    newPassword2Error}
                >
                  Valider
                </Button>
              {:catch}
                <Button
                  class="primary-color"
                  on:click={handleChangePassword}
                  disabled={!newPassword ||
                    newPasswordError ||
                    newPassword2Error}
                >
                  Valider
                </Button>
              {/await}
            </div>
          </div>
        {/if}

        <br />
        <div class="d-flex">
          <div class="flex-grow-1" />
          <Button on:click={userQuery.logout} text class="red-text">
            Déconnexion
          </Button>
        </div>

        <br />
      </div>
    </Card>
  </div>
{/if}

<style>
  .container {
    margin: auto;
    max-width: 850px;
    height: 100%;
  }
</style>
