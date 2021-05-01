<script>
  import { fly } from 'svelte/transition'

  import Tips from '$lib/Tips.svelte'
  import { troc } from '$lib/stores.js'

  //export let scoped

  let tipsOpen = false
</script>

<!--<Tips bind:open={tipsOpen} headerHeight={scoped.headerHeight}/>-->
<Tips bind:open={tipsOpen} />

<main class:tipsOpen>
  <slot />

  {#if $troc && $troc.is_try}
    <div
      transition:fly={{ y: 40, delay: 500, duration: 800 }}
      style={`width: calc(100% - ${tipsOpen ? 400 : 0}px);`}
      class="try-bannear"
    >
      <b>Troc d'entrainement</b>
    </div>
  {/if}
</main>

<style>
  main {
    transition: margin 0.4s ease;
    height: 100%;
  }

  main.tipsOpen {
    margin-left: 400px;
  }
</style>
