<script>
  import { Button } from 'svelte-materialify'
  import { faSearch, faBars, faPlus } from '@fortawesome/free-solid-svg-icons'
  import { faNewspaper } from '@fortawesome/free-regular-svg-icons'

  import layout from '$lib/store/layout'
  import IconLink from '$lib/util/IconLink.svelte'
  import ControllerCard from '$lib/util/ControllerCard.svelte'
</script>

<div class="container">
  <div class="main">
    <div class="main-content">
      <slot />
    </div>
  </div>

  <div class="controllers" style="max-height: {$layout.mainHeight}px;">
    <div class="controllers-content">
      <a href="/activity2">index</a>
      <a href="/activity2/search">search</a>

      <ControllerCard icon={faSearch} title="Recherche">
        Contoller
      </ControllerCard>
      <br />
      <ControllerCard icon={faBars} title="Mes trocs" />
      <br />
      <ControllerCard icon={faNewspaper} title="Activité" />
      <br />

      <Button class="primary-color">
        <IconLink icon={faPlus} />&nbsp; Organiser un troc
      </Button>
    </div>
  </div>
</div>

<style>
  .container {
    display: grid;
    grid-template-areas: 'main controllers';
    grid-template-columns: auto minmax(400px auto);
    justify-items: center;
  }

  .controllers {
    border: dotted aqua 1px;
    overflow-y: auto;
    padding: 1em;
  }

  .controllers-content {
    max-width: 650px;
    min-width: 450px;
  }

  .main {
  }
</style>
