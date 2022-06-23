<script lang="ts">
  import { troc } from '$lib/troc/store'
  import TrocCard from '$lib/troc/Card.svelte'
</script>

<div class="container" style="max-width: 1000px; margin: auto;">
  <TrocCard troc={$troc} />
</div>

<style>
  .container {
    max-width: 850px;
    margin: auto;
  }
</style>
