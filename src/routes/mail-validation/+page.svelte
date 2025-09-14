<script lang="ts">
  import { Button, Icon } from "$lib/material";
  import Logo from "$lib/draw/Logo.svelte";
  import { userQuery } from "$lib/user/store";
  import { layout } from "$lib/store/layout";
  import { param } from "$lib/param";
  import { onMount } from "svelte";

  let error: string | undefined;
  onMount(() => {
    $layout.isFooterDisplay = true;
    return () => {
      $layout.isFooterDisplay = false;
    };
  });

  userQuery
    .validMail($param.get("token") || "")
    .then(() => {
      document.location.replace("/trocs");
    })
    .catch((e) => (error = e));
</script>

<div
  class="centered"
  style="height: {$layout.mainHeight}px; flex-direction: column;"
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
