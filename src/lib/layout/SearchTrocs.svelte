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

  /** Scroll et attire l'attention sur le bon troc quand on click sur un marker. */
  function handleClickMarker(event) {
    const trocElement = trocsElement[event.detail._id]
    console.log(trocElement.offsetTop, map.boxZoom._container.offsetTop)
    const positionTarget = trocElement.offsetTop - 265
    window.scrollTo({
      top: positionTarget || 0,
      behavior: 'smooth',
    })

    function animate() {
      trocElement.classList.add('animate__animated', 'animate__shakeX')
      setTimeout(() => {
        trocElement.classList.remove('animate__animated', 'animate__shakeX')
      }, 500)
    }

    /* Déclenche l'animation dés que le scroll est static */
    let position = null
    const checkIfScrollIsStatic = setInterval(() => {
      if (position === window.scrollY) {
        clearInterval(checkIfScrollIsStatic)
        animate()
      }
      position = window.scrollY
    }, 50)
  }

  /** Zoom sur le bon marker de la map quand on click sur un troc. */
  function handleClickTroc(event) {
    const troc = event.detail
    map?.setView(troc.location, 8)
  }

  /** Affiche la dialoge d'articles quand on click sur "Fouiller les articles". */
  function handleClickArticles(event) {
    const troc = event.detail
    console.log({ troc })
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
      on:clickArticles={handleClickArticles}
    />
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
