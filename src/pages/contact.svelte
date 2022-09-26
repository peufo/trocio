<!-- routify:options isFooterDisplay=true -->
<script lang="ts">
  import { TextField, Textarea, Button } from 'svelte-materialify/src'
  import { useMutation } from '@sveltestack/svelte-query'

  import type { IMessageCreate } from 'types'
  import { user } from '$lib/user/store'
  import { api } from '$lib/api'
  import Loader from '$lib/util/Loader.svelte'

  let content = ''
  let authorMail = ''

  const querySend = useMutation((data: IMessageCreate) =>
    api('/api/messages/contact', {
      method: 'post',
      data,
      success: 'Message envoyé',
    })
  )

  function handleSendMessage() {
    const data = $user ? { content } : { content, authorMail }
    $querySend.mutate(data)
  }
</script>

<main class="pa-4">
  <br />
  <br />

  <h4 class="text-center">Contact</h4>
  <br />
  <br />

  {#if !$querySend.isSuccess}
    <div>
      <Textarea outlined autogrow bind:value={content}>Votre message</Textarea>

      <div class="d-flex mt-4 flex-wrap">
        {#if $user}
          <div>De la part de {$user.name}</div>
        {:else}
          <TextField
            type="mail"
            outlined
            dense
            bind:value={authorMail}
            style="max-width: 300px;"
          >
            Votre email
          </TextField>
        {/if}
        <div class="flex-grow-1" />
        {#if $querySend.isLoading}
          <Button disabled text>
            <Loader title="Envoie en cours" />
          </Button>
        {:else}
          <Button class="primary-color" on:click={handleSendMessage}>
            Envoyer
          </Button>
        {/if}
      </div>
    </div>
  {:else}
    <div class="text-center text-opacity pt-12 mt-12">
      Merci pour votre message, nous vous répondrons aussi vite que possible.
    </div>
  {/if}
</main>

<style>
  main {
    max-width: 800px;
    margin: auto;
  }
</style>
