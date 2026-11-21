<!-- routify:options isFooterDisplay=true -->
<script>
  import TermsOfUse from '$lib/layout/Terms-of-use.md'

  /**
   * Clic sur un titre : met l'ancre dans l'URL et défile jusqu'au titre,
   * sans passer par le routeur (qui rechargerait la page).
   */
  function handleAnchorClick(event) {
    const link = event.target.closest('a.anchor')
    if (!link) return
    const hash = link.getAttribute('href')
    const target = document.getElementById(hash.slice(1))
    if (!target) return
    event.preventDefault()
    const replaceState = history['replaceStateNative'] || history.replaceState
    replaceState.call(history, history.state, '', hash)
    target.scrollIntoView({ behavior: 'smooth' })
  }
</script>

<main>
  <br />
  <br />
  <h4 class="text-center">Conditions d'utilisation</h4>
  <br />
  <!-- svelte-ignore a11y-click-events-have-key-events a11y-no-static-element-interactions -->
  <div class="pa-3" on:click={handleAnchorClick}>
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
