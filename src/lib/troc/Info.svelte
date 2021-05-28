<script lang="ts">
  import { createEventDispatcher } from 'svelte'
  import { fly, fade, slide } from 'svelte/transition'
  import {
    faChild,
    faCubes,
    faTableTennis,
    faStoreAltSlash,
    faMapMarkerAlt,
    faCalendarAlt,
    faUserAlt,
    faExternalLinkAlt,
    faCog,
    faCashRegister,
    faChevronRight,
  } from '@fortawesome/free-solid-svg-icons'
  import { Button, Chip } from 'svelte-materialify'
  import dayjs from 'dayjs'
  import relativeTime from 'dayjs/plugin/relativeTime'
  import 'dayjs/locale/fr'
  dayjs.locale('fr')
  dayjs.extend(relativeTime)

  import IconLink from '$lib/util/IconLink.svelte'
  import { user } from '$lib/user/store'
  import { convertDMS } from '$lib/utils.js'
  import ArticleList from '$lib/article/List.svelte'

  const dispatch = createEventDispatcher()

  export let troc = null
  export let displayGetActivity = true
  export let articlesOpen = true
  export let activityOpen = false

  let tabs = [
    { name: 'LOCATION', icon: faMapMarkerAlt },
    { name: 'SCHEDULE', icon: faCalendarAlt },
    !!troc.society && { name: 'SOCIETY', icon: faUserAlt },
  ].filter(Boolean)
  let tabIndex = 0
  const DESCRIPTION_SIZE = 250
  let sliceDescription = DESCRIPTION_SIZE
</script>

<div class="d-flex flex-column flex-sm-row justify-space-between">
  <div>
    <h6>{troc.name}</h6>

    <!-- Chips infos -->
    <Chip size="small" outlined class="text--secondary">
      <IconLink icon={faChild} size=".7em" />
      <span>{troc.subscriber}</span>
    </Chip>

    <Chip size="small" outlined class="text--secondary">
      <IconLink icon={faCubes} size=".7em" />
      <span>{troc.articles}</span>
    </Chip>

    {#if troc.is_try}
      <Chip size="small" label class="deep-orange darken-3 white-text">
        <IconLink icon={faTableTennis} size=".7em" />
        <span>Entrainement</span>
      </Chip>
    {/if}

    {#if troc.isClosed}
      <Chip size="small" label class="deep-orange darken-3 white-text">
        <IconLink icon={faStoreAltSlash} size=".7em" />
        <span>Terminé</span>
      </Chip>
    {/if}

    <br />

    <p class="describe pt-3">
      {troc.description.slice(0, sliceDescription)}

      {#if troc.description.length > sliceDescription}
        <span
          class="showDescription"
          on:click={() => (sliceDescription = Infinity)}
        >
          ...Afficher
        </span>
      {:else if troc.description.length > DESCRIPTION_SIZE && sliceDescription == Infinity}
        <span
          class="showDescription"
          on:click={() => (sliceDescription = DESCRIPTION_SIZE)}
        >
          Réduire
        </span>
      {/if}
    </p>
  </div>

  <div class="info">
    <div class="content-info w3-display-container">
      {#if tabs[tabIndex].name === 'LOCATION' && !!troc.address}
        <div
          in:fly|local={{ x: 60, duration: 300, delay: 200 }}
          out:fade|local={{ duration: 300 }}
          class="w3-display-middle"
        >
          {#each troc.address.split(', ') as segment}
            {segment}<br />
          {/each}

          <a
            style="line-height: 2.5;"
            rel="noreferrer"
            href={`https://www.google.ch/maps/place/${convertDMS(
              troc.location
            )}`}
            target="_blank"
            title="Ouvrir dans Google Maps"
          >
            Google Maps
            <IconLink
              class="ml-1"
              icon={faExternalLinkAlt}
              size="1em"
              style="color: var(--theme-text-link)"
            />
          </a>
        </div>
      {:else if tabs[tabIndex].name === 'SCHEDULE'}
        <div
          in:fly|local={{ x: 60, duration: 300, delay: 200 }}
          out:fade|local={{ duration: 300 }}
          style="width: 75%"
          class="w3-display-middle w3-right-align"
        >
          <b
            >{dayjs(
              troc.schedule && troc.schedule[0] && troc.schedule[0].open
            ).fromNow()}</b
          >

          <br />

          {#each troc.schedule as day}
            {dayjs(day.open).format('dddd DD.MM.YY [d]e H[h]mm à ')}
            {dayjs(day.close).format('H[h]mm')}
            <br />
          {/each}
        </div>
      {:else if tabs[tabIndex].name === 'SOCIETY'}
        <div
          in:fly|local={{ x: 60, duration: 300, delay: 200 }}
          out:fade|local={{ duration: 300 }}
          class="w3-display-middle"
        >
          <b>{troc.society}</b><br />

          {#if !!troc.societyweb}
            <a
              class="w3-opacity"
              style="line-height: 2.5;"
              href={`http://${troc.societyweb}`}
              target="_blank"
              title="Ouvrir le site internet de l'organisateur"
            >
              {troc.societyweb}
              <IconLink
                class="ml-1"
                icon={faExternalLinkAlt}
                size="1em"
                style="color: var(--theme-text-link)"
              />
            </a>
          {/if}
        </div>
      {/if}
    </div>
    <div class="tabs">
      {#each tabs as tab, i}
        <div
          class="tab"
          on:click={() => (tabIndex = i)}
          class:before-selected={tabIndex === i + 1}
          class:selected={tabIndex === i}
          class:after-selected={tabIndex === i - 1}
        >
          <IconLink icon={tab.icon} disabled={tabIndex !== i} />
        </div>
      {/each}
    </div>
  </div>
</div>

<!-- Bar du fond -->
<div class="bar">
  <Button
    on:click={() => {
      if ((articlesOpen = !articlesOpen)) activityOpen = false
    }}
    text={!articlesOpen}
    depressed={articlesOpen}
  >
    Les articles
    <IconLink
      icon={faChevronRight}
      rotate={articlesOpen ? 90 : 0}
      class="ml-2"
      style="opacity: 0.6"
      size="1.1em"
    />
  </Button>

  {#if displayGetActivity && (!troc.isClosed || troc.isSubscribed)}
    <Button
      on:click={() => {
        if ((activityOpen = !activityOpen)) articlesOpen = false
      }}
      text={!activityOpen}
      depressed={activityOpen}
    >
      {troc.isSubscribed ? 'Mon activité' : 'Participer au troc'}
      <IconLink
        icon={faChevronRight}
        rotate={activityOpen ? 90 : 0}
        class="ml-2"
        style="opacity: 0.6"
        size="1.1em"
      />
    </Button>
  {/if}

  {#if !!$user && troc.isAdmin}
    <a href={`/admin?troc=${troc._id}`}>
      <Button text>
        <IconLink icon={faCog} class="mr-2" size="1.2em" />
        Page d'administration
      </Button>
    </a>
  {:else if !!$user && troc.isCashier}
    <a href={`/cashier?troc=${troc._id}`}>
      <Button text>
        <IconLink icon={faCashRegister} class="mr-2" size="1.2em" />
        Caisse
      </Button>
    </a>
  {/if}
</div>

{#if articlesOpen}
  <div transition:slide|local>
    <ArticleList trocId={troc._id} />
  </div>
{/if}

{#if activityOpen}
  <div transition:slide|local>Activité</div>
{/if}

<style>
  .describe {
    text-align: justify;
    word-wrap: break-word;
  }

  .info {
    height: 220px;
    min-width: 380px;
    display: flex;
  }

  .content-info {
    width: 100%;
    padding: 20px;
  }

  .bar,
  .tabs {
    --border-width: 1px;
    --border-width-negatif: -1px;
    --border-width-double: 2px;
  }

  .bar {
    min-height: 3em;
    margin-right: 10px;
    /*border-top: var(--border-width) solid var(--theme-tabs);*/
    padding-top: 10px;
  }

  .tabs {
    flex-grow: 1;
    display: flex;
    flex-direction: column;
    align-content: stretch;
  }

  .tab {
    flex-grow: 1;
    font-size: x-large;
    width: 50px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-left: var(--border-width) solid transparent;
    position: relative;
    cursor: pointer;
  }

  .tab.selected {
    z-index: 1;
  }

  .tab.selected:after {
    content: '';
    position: absolute;
    width: calc(50% + var(--border-width));
    height: calc(100% + var(--border-width-double));
    right: 0px;
    top: var(--border-width-negatif);
    border-top: var(--border-width) solid var(--theme-tabs);
    border-right: var(--border-width) solid var(--theme-tabs);
    border-bottom: var(--border-width) solid var(--theme-tabs);
    border-top-right-radius: 10px;
    border-bottom-right-radius: 10px;
  }

  .tab:first-child.selected:after {
    border-top: transparent;
    border-top-right-radius: 10px;
  }

  /*.tab:last-child.selected:after  {
        border-bottom: var(--border-width)  solid #fff;
        border-bottom-right-radius: 0px;
    }*/

  .tab.before-selected:after {
    content: '';
    position: absolute;
    width: 50%;
    height: 100%;
    left: var(--border-width-negatif);
    bottom: 0px;
    border-left: var(--border-width) solid var(--theme-tabs);
    border-bottom: var(--border-width) solid var(--theme-tabs);
    border-bottom-left-radius: 10px;
  }

  .tab.after-selected:after {
    content: '';
    position: absolute;
    width: 50%;
    height: 100%;
    left: var(--border-width-negatif);
    top: 0px;
    border-left: var(--border-width) solid var(--theme-tabs);
    border-top: var(--border-width) solid var(--theme-tabs);
    border-top-left-radius: 10px;
  }

  .tab:not(.selected):not(.before-selected):not(.after-selected) {
    border-left: var(--border-width) solid var(--theme-tabs);
  }

  .showDescription {
    font-size: 0.6em;
    text-transform: uppercase;
    padding: 0.6em 1em;
    border-radius: 4px;
    cursor: pointer;
    background: #eee;
  }

  .showDescription:hover {
    background: #ddd;
  }

  :global(.theme--dark) .showDescription {
    background: #333;
  }
  :global(.theme--dark) .showDescription:hover {
    background: #444;
  }
</style>
