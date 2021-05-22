<script>
  import { Button, Icon } from 'svelte-materialify'
  import {
    faMapMarkerAlt,
    faExchangeAlt,
    faCashRegister,
    faPlus,
  } from '@fortawesome/free-solid-svg-icons'
  import { faNewspaper } from '@fortawesome/free-regular-svg-icons'

  import IconLink from '$lib/util/IconLink.svelte'
  import logo from '$assets/logo'

  import layout from '$lib/store/layout'
  import ControllerCard from '$lib/util/ControllerCard.svelte'
  import TrocSearch from '$lib/troc/Search.svelte'
  import TrocResult from '$lib/troc/Result.svelte'

  let containerWidth = 0

  $: console.log(containerWidth)
</script>

<div class="container" bind:offsetWidth={containerWidth}>
  <div
    class="controllers"
    style="--layout-main-height: {$layout.mainHeight}px;"
  >
    <div class="controllers-content">
      <ControllerCard title="Trouver un troc">
        <div slot="icon"><IconLink icon={faMapMarkerAlt} /></div>
        <TrocSearch />
      </ControllerCard>
      <br />
      <ControllerCard title="Mes comptes">
        <div slot="icon"><IconLink icon={faCashRegister} /></div>
      </ControllerCard>
      <br />
      <ControllerCard title="Mes échanges">
        <div slot="icon"><IconLink icon={faExchangeAlt} /></div>
      </ControllerCard>
      <br />
      <ControllerCard title="Activité">
        <div slot="icon"><IconLink icon={faNewspaper} /></div>
      </ControllerCard>
      <br />
      <ControllerCard title="Mes trocs">
        <div slot="icon"><Icon {...logo} /></div>
      </ControllerCard>
      <br />

      <Button class="primary-color">
        <IconLink icon={faPlus} />&nbsp; Organiser un troc
      </Button>
    </div>
  </div>
  <div class="main">
    <div class="main-content">
      <TrocResult />
    </div>
  </div>
</div>

<style>
  .container {
    display: grid;
    grid-template-areas: 'controllers main';
    grid-template-columns: minmax(auto, 500px) auto;
    justify-items: center;
  }

  .controllers {
    padding: 2em;
    grid-area: controllers;
    overflow-y: auto;
    position: sticky;
    top: 0px;
    max-height: var(--layout-main-height);
  }

  .controllers-content {
    max-width: 650px;
    min-width: 450px;
  }

  .main {
    grid-area: main;
  }

  @media screen and (max-width: 1350px) {
    .container {
      display: block;
    }
    .main {
    }
    .controllers {
    }
  }
</style>
