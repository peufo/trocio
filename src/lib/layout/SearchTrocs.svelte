<script lang="ts">
  import SearchTrocsControl from '$lib/control/SearchTrocs.svelte'
  import SearchTrocsInfo from '$lib/info/SearchTrocs.svelte'
  import {
    useSearchTrocs,
    useSearchTrocsOptions,
  } from '$lib/store/useSearchTrocs'
  import layout from '$lib/store/layout'

  let query = {}
  let trocs = []
  let trocsElement: HTMLElement[] = []
  const queryTrocs = useSearchTrocs(query)
  $: queryTrocs.setOptions(useSearchTrocsOptions(query))
  $: {
    trocs = $queryTrocs.data ? $queryTrocs.data.pages.flat() : []
  }

  function clickMarker(event) {
    console.log(trocsElement[event.detail._id].offsetTop)
    window.scrollTo({
      top: trocsElement[event.detail._id]?.offsetTop - 150 || 0,
      behavior: 'smooth',
    })
  }
</script>

<div class="container">
  <div class="controller" style="max-height: {$layout.mainHeight}px;">
    <SearchTrocsControl bind:query {trocs} on:clickMarker={clickMarker} />
  </div>

  <div class="info">
    <SearchTrocsInfo {queryTrocs} {trocs} bind:trocsElement />
  </div>
</div>

<style>
  .container {
    display: grid;
    grid-template-columns: minmax(400px, 450px) minmax(600px, 850px);
    grid-template-areas: 'controller info';
    max-width: 100%;
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
