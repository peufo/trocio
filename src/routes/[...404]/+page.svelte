<script>
  import { Button } from "$lib/material";
  import { layout, isDarkTheme } from "$lib/store/layout";

  import forestLight from "$lib/assets/images/forest-720.png";
  import forestDark from "$lib/assets/images/forest-dark.jpg";
  import { onMount } from "svelte";

  export let scoped;

  onMount(() => {
    $layout.isFooterDisplay = true;
    return () => {
      $layout.isFooterDisplay = false;
    };
  });
</script>

<div
  class="image"
  style="min-height: {scoped.mainHeight}px; background-image: url({$isDarkTheme
    ? forestDark
    : forestLight});"
>
  <br /><br /><br /><br />
  <h4>Nous ne trouvons pas ce que vous cherchez</h4>
  <br /><br />
  <a href="/">
    <Button>Retour à la page d'accueil</Button>
  </a>
</div>

<style>
  .image {
    text-transform: uppercase;
    text-align: center;
    color: #fff;

    background-position-x: center;
    background-size: cover;
  }
</style>
