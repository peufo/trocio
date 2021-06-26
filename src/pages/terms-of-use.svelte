<!-- routify:options isFooterDisplay=true -->
<script>
  import TermsOfUse from '$lib/layout/Terms-of-use.svelte'
</script>

<main>
  <br />
  <br />
  <h4 class="w3-center">Conditions d'utilisation</h4>
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
