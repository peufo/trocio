<!-- routify:options isFooterDisplay=true -->
<script lang="ts">
  import { params } from '@roxi/routify'
  import { Button, Icon } from 'svelte-materialify/src'
  import Logo from '$lib/draw/Logo.svelte'
  import { user, userQuery } from '$lib/user/store'
  export let scoped: LayoutScoped

  let error: string | undefined

  userQuery
    .validMail($params.validator)
    .then((data) => {
      error = undefined
      userQuery.set({ ...$user, ...data })
    })
    .catch((e) => (error = e))
</script>

<div
  on:click={() =>
    userQuery.validMail($params.validator).then((data) => {
      userQuery.set({ ...$user, ...data })
    })}
  class="centered"
  style="height: {scoped.mainHeight}px; flex-direction: column;"
>
  <div style="height: 200px;">
    {#await $userQuery}
      <Logo cubeSize={150} />
    {:then user}
      {#if error}
        <h3>Oups, une erreur s'est produite 🤔</h3>
        <pre>{error}</pre>
      {:else if !user.mailvalided}
        <h3>Désolé, votre email n'est pas validé</h3>
      {:else}
        <h3>Merci, votre email est validé ✔</h3>
      {/if}
    {/await}
  </div>

  <a href="/">
    <Button>
      <Icon class="fas fa-home" />&nbsp; Retour à l'accueil
    </Button>
  </a>
</div>
