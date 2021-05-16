<script lang="ts">
  import layout from '$lib/store/layout'

  import Controle from './Controle.svelte'
  import Info from './Info.svelte'
</script>

<div class="container">
  <div class="controller" style="max-height: {$layout.mainHeight}px;">
    <Controle />
  </div>

  <div class="info">
    <Info />
  </div>
</div>

<style>
  .container {
    display: grid;
    grid-template-columns: minmax(400px, 450px) minmax(600px, 850px);
    grid-template-areas: 'controller info';
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
