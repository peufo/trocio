<script>
  import { Button, Icon } from 'svelte-materialify'
  import { faMapMarkerAlt, faPlus } from '@fortawesome/free-solid-svg-icons'
  import { isActive, redirect } from '@roxi/routify'

  import IconLink from '$lib/util/IconLink.svelte'
  import logo from '$assets/logo'

  import layout from '$lib/store/layout'
  import ControllerCard from '$lib/util/ControllerCard.svelte'
  import TrocSearch from '$lib/troc/Search.svelte'
  import TrocSubscribed from '$lib/troc/Subscribed.svelte'

  let offsetWidth = 1000
</script>

<div
  class="container"
  bind:offsetWidth
  style="
  --layout-main-height: {$layout.mainHeight}px;
  --layout-main-width: {offsetWidth}px;
  --layout-controller-width: {offsetWidth < 500 ? offsetWidth : 500}px;
  "
  class:show-result={!$isActive('./index')}
>
  <div class="controllers">
    <div class="controllers-content pa-4">
      <ControllerCard
        title="Explorer"
        controlled
        open={$isActive('./explore')}
        on:open={() => $redirect('./explore')}
        on:close={() => $redirect('./')}
      >
        <div slot="icon"><IconLink icon={faMapMarkerAlt} /></div>
        <TrocSearch />
      </ControllerCard>
      <br />

      <ControllerCard
        title="Mes trocs"
        controlled
        open={$isActive('./my')}
        on:open={() => $redirect('./my')}
        on:close={() => $redirect('./')}
      >
        <div slot="icon"><Icon {...logo} /></div>
        <TrocSubscribed />
      </ControllerCard>
      <br />
      <a href="/trocs/create">
        <Button class="primary-color" outlined>
          <IconLink icon={faPlus} />&nbsp; Organiser un troc
        </Button>
      </a>
    </div>
  </div>
  <div class="results pt-4 pb-4">
    <slot />
  </div>
</div>

<style lang="scss">
  .container {
    display: flex;
    > div {
      transition: width 0.5s;
    }
  }

  .controllers {
    width: var(--layout-main-width);
    max-height: var(--layout-main-height);
    overflow-y: auto;
    position: sticky;
    top: 0px;
    flex-shrink: 0;
  }

  .results {
    width: 0px;
    flex-shrink: 1;
  }

  .show-result {
    > .controllers {
      width: var(--layout-controller-width);
    }
    > .results {
      width: var(--layout-main-width);
    }
  }

  .controllers-content {
    margin: auto;
    min-width: 400px;
    max-width: var(--layout-controller-width);
  }

  @media screen and (max-width: 1350px) {
    .container {
    }
    .results {
    }
    .controllers {
    }
  }
</style>
