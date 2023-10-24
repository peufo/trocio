<script lang="ts">
  import { Button, TextField, Icon, Card } from '$material'

  import Loader from '$lib/util/Loader.svelte'
  import { userQuery } from '$lib/user/store'
  import { params, goto } from '@roxi/routify'

  import RULES from '$lib/rules'

  let newPassword = ''
  let newPasswordError = false
  let pending = false

  async function handleChangePassword() {
    pending = true
    userQuery
      .resetPwd({
        token: $params['token'],
        newPassword,
      })
      .then(() => {
        document.location.replace('/trocs')
      })
      .finally(() => {
        pending = false
      })
  }
</script>

<div class="container pa-2">
  <Card class="pa-8 pt-16">
    <div style="max-width: 500px; margin: auto;">
      <h5 class="mb-8">Changement de votre mot de passe</h5>

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

      <div class="d-flex">
        <div class="flex-grow-1" />
        {#if pending}
          <Button text disabled>
            <Loader title="Modification du mot de passe..." />
          </Button>
        {:else}
          <Button
            class="primary-color"
            on:click={handleChangePassword}
            disabled={!newPassword || newPasswordError}
          >
            Valider
          </Button>
        {/if}
      </div>
    </div>
  </Card>
</div>

<style>
  .container {
    margin: auto;
    max-width: 850px;
    height: 100%;
  }
</style>
