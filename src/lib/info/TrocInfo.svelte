<script lang="ts">
  import { createEventDispatcher } from 'svelte'
  import { fly, fade } from 'svelte/transition'

  import { Button } from 'svelte-materialify'
  import dayjs from 'dayjs'
  import relativeTime from 'dayjs/plugin/relativeTime'
  import 'dayjs/locale/fr'
  dayjs.locale('fr')
  dayjs.extend(relativeTime)

  import { user } from '$lib/store/user'
  import { convertDMS } from '$lib/utils.js'

  const dispatch = createEventDispatcher()

  export let troc = null
  export let displayGetActivity = true

  let tabs = [
    { name: 'LOCATION', icon: 'fas fa-map-marker-alt' },
    { name: 'SCHEDULE', icon: 'far fa-calendar-alt' },
  ]
  let tabIndex = 0
  const DESCRIPTION_SIZE = 250
  let sliceDescription = DESCRIPTION_SIZE

  if (!!troc.society)
    tabs = [...tabs, { name: 'SOCIETY', icon: 'fas fa-user-tie' }]
</script>

<div class="w3-row">
  <div class="w3-col m6">
    <span class="w3-large">{troc.name}</span>

    <br />

    <!-- Infos -->
    <span>
      <i class="fas fa-child w3-opacity" />
      {troc.subscriber}
    </span>
    <span style="margin-left: 1em;">
      <i class="fas fa-cubes w3-opacity" />
      {troc.articles}
    </span>

    {#if troc.is_try || troc.isClosed}
      <span style="margin-left: 1em;">
        <i
          class="fas {troc.is_try
            ? 'fa-table-tennis'
            : 'fa-door-closed'} w3-opacity"
        />
        {troc.is_try ? 'Entrainement' : 'Terminé'}
      </span>
    {/if}

    <br /><br />

    <p class="describe">
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

  <div class="w3-col m6 info">
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
            class="w3-opacity"
            style="line-height: 2.5;"
            href={`https://www.google.ch/maps/place/${convertDMS(
              troc.location
            )}`}
            target="_blank"
            title="Ouvrir dans Google Maps"
          >
            Google Maps
            <i class="fas fa-external-link-alt" />
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
              <i class="fas fa-external-link-alt" />
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
          <i class={tab.icon} />
        </div>
      {/each}
    </div>
  </div>
</div>

<!-- Bar du fond -->
<div class="bar">
  <Button on:click={() => dispatch('clickArticles')} color="secondary">
    Fouiller les articles
  </Button>

  {#if displayGetActivity && (!troc.isClosed || troc.isSubscribed)}
    <Button href={`/activity/detail?troc=${troc._id}`}>
      {troc.isSubscribed ? 'Voir mon activité' : 'Participer au troc'}
    </Button>
  {/if}

  {#if !!$user && troc.isAdmin}
    <Button href={`/admin?troc=${troc._id}`} color="secondary">
      <i class="fa fa-cog w3-large" />&nbsp; Page d'administration
    </Button>
  {:else if !!$user && troc.isCashier}
    <Button href={`/cashier?troc=${troc._id}`} color="secondary">
      <i class="fa fa-cash-register w3-large" />&nbsp; Caisse
    </Button>
  {/if}
</div>

<style>
  .describe {
    text-align: justify;
    word-wrap: break-word;
  }

  .info {
    height: 220px;
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
    --border-color: #bbb;
  }

  :global(.theme--dark) .bar,
  :global(.theme--dark) .tabs {
    --border-color: #333;
  }

  .bar {
    min-height: 3em;
    margin-right: 10px;
    border-top: var(--border-width) solid var(--border-color);
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
    color: #aaa;
    width: 50px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-left: var(--border-width) solid rgba(0, 0, 0, 0);
    position: relative;
    cursor: pointer;
  }

  .tab.selected {
    color: #ddd;
    z-index: 1;
  }

  .tab.selected:after {
    content: '';
    position: absolute;
    width: calc(50% + var(--border-width));
    height: calc(100% + var(--border-width-double));
    right: 0px;
    top: var(--border-width-negatif);
    border-top: var(--border-width) solid var(--border-color);
    border-right: var(--border-width) solid var(--border-color);
    border-bottom: var(--border-width) solid var(--border-color);
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
    border-left: var(--border-width) solid var(--border-color);
    border-bottom: var(--border-width) solid var(--border-color);
    border-bottom-left-radius: 10px;
  }

  .tab.after-selected:after {
    content: '';
    position: absolute;
    width: 50%;
    height: 100%;
    left: var(--border-width-negatif);
    top: 0px;
    border-left: var(--border-width) solid var(--border-color);
    border-top: var(--border-width) solid var(--border-color);
    border-top-left-radius: 10px;
  }

  .tab:not(.selected):not(.before-selected):not(.after-selected) {
    border-left: var(--border-width) solid var(--border-color);
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
