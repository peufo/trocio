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
  let map
  const queryTrocs = useSearchTrocs(query)
  $: queryTrocs.setOptions(useSearchTrocsOptions(query))
  $: {
    trocs = $queryTrocs.data ? $queryTrocs.data.pages.flat() : []
  }

  function handleClickMarker(event) {
    const trocElement = trocsElement[event.detail._id]
    const moveScroll = Math.abs(window.scrollY - (trocElement.offsetTop - 150))
    window.scrollTo({
      top: trocElement.offsetTop - 150 || 0,
      behavior: 'smooth',
    })
    setTimeout(() => {
      trocElement.classList.add('animate__animated', 'animate__shakeX')
      setTimeout(() => {
        trocElement.classList.remove('animate__animated', 'animate__shakeX')
      }, 500)
    }, moveScroll / 3)
  }

  function handleClickTroc(event) {
    const troc = event.detail
    map?.setView(troc.location, 8)
  }
</script>

<div class="container">
  <div class="controller" style="max-height: {$layout.mainHeight}px;">
    <SearchTrocsControl
      bind:query
      {trocs}
      on:clickMarker={handleClickMarker}
      bind:map
    />
  </div>

  <div class="info">
    <SearchTrocsInfo
      {queryTrocs}
      {trocs}
      bind:trocsElement
      on:clickTroc={handleClickTroc}
    />
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
