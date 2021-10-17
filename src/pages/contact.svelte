<!-- routify:options isFooterDisplay=true -->
<script>
  import { TextField, Textarea, Button } from 'svelte-materialify'
  import { user } from '$lib/user/store'
</script>

<main>
  <br />
  <br />
  <h4 class="text-center">Contact</h4>
  <br />
  <br />
  <div>
    <Textarea outlined autogrow>Votre message</Textarea>

    <div class="d-flex mt-4">
      {#if $user}
        <div>De la part de {$user.name}</div>
      {:else}
        <TextField type="mail" outlined dense>Votre email</TextField>
      {/if}
      <div class="flex-grow-1" />
      <Button class="primary-color">Envoyer</Button>
    </div>
  </div>

  <div class="text-center text-opacity pt-12">
    Merci pour votre message, nous vous répondrons aussi vite que possible.
  </div>
</main>

<style>
  main {
    max-width: 800px;
    margin: auto;
  }
</style>
