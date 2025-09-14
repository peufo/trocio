<script>
  import { layout } from "$lib/store/layout";
  import { onMount } from "svelte";
  import TermsOfUse from "./content.svx";

  onMount(() => {
    $layout.isFooterDisplay = true;
    return () => {
      $layout.isFooterDisplay = false;
    };
  });
</script>

<main>
  <br />
  <br />
  <h4 class="text-center">Conditions d'utilisation</h4>
  <br />
  <div class="pa-3">
    <TermsOfUse />
  </div>
</main>

<style>
  main {
    min-height: 620px;
    max-width: 650px;
    margin: auto;
  }
</style>
