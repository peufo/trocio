<script lang="ts">
  import layout from '$lib/store/layout'

  import TrocSearch from './Search.svelte'
  import TrocResult from './Result.svelte'
</script>

<div class="container">
  <div class="controller" style="max-height: {$layout.mainHeight}px;">
    <TrocSearch />
  </div>

  <div class="info">
    <TrocResult />
  </div>
</div>

<style>
  .container {
    display: grid;
    grid-template-areas: 'controller info';
    grid-template-columns: minmax(400px, 450px) minmax(600px, 850px);
    justify-content: center;
  }

  .controller {
    grid-area: controller;
    position: sticky;
    top: 0px;
    overflow-y: auto;
    padding: 1em;
  }

  .info {
    grid-area: info;
  }
</style>
