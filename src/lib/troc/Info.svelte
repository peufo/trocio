<script lang="ts">
  import { slide } from 'svelte/transition'
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
    faMapMarkedAlt,
    faSignInAlt,
    faStoreAlt,
    faSignOutAlt,
    faShoppingBasket,
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
  import UserResum from '$lib/troc/UserResum.svelte'
  import type { Troc } from 'types'

  export let troc: Troc
  export let displayGetActivity = true
  export let articlesOpen = false
  export let activityOpen = false

  let tabs = [
    { name: 'LOCATION', icon: faMapMarkerAlt },
    { name: 'SCHEDULE', icon: faCalendarAlt },
    !!troc.society && { name: 'SOCIETY', icon: faUserAlt },
  ].filter(Boolean)
  let tabIndex = 0
  const DESCRIPTION_SIZE = 250
  let sliceDescription = DESCRIPTION_SIZE

  const scheduleIcon = {
    open: faStoreAlt,
    deposit: faSignInAlt,
    recovery: faSignOutAlt,
    sale: faShoppingBasket,
  }
</script>

<div class="container">
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
      <Chip size="small" label class="amber darken-3 white-text">
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

  <div class="pl-5 pb-5">
    {#if !troc.is_try}
      <div class="d-flex pt-5">
        <IconLink icon={faMapMarkerAlt} opacity />
        <div class="pl-4">
          {#each troc.address.split(', ') as segmentAddress}
            {segmentAddress}<br />
          {/each}
          <!--
          TODO: Imprecis
          <a
            style="line-height: 2.5;"
            rel="noreferrer"
            href={`https://www.google.ch/maps/place/${convertDMS(troc.location)}`}
            target="_blank"
            title="Ouvrir dans Google Maps"
          >
            <IconLink
              class="ml-1"
              icon={faMapMarkedAlt}
              size="1em"
              style="color: var(--theme-text-link)"
            />
          </a>
        -->
        </div>
      </div>

      <div class="d-flex pt-5">
        <IconLink icon={faCalendarAlt} opacity />
        <div class="pl-4">
          <b
            >{dayjs(
              troc.schedule && troc.schedule[0] && troc.schedule[0].open
            ).fromNow()}</b
          >

          <br />

          {#each troc.schedule as period}
            <IconLink
              icon={scheduleIcon[period.name] || scheduleIcon.open}
              size="1em"
              opacity
            />
            {dayjs(period.open).format('dddd DD.MM.YY [d]e H[h]mm à ')}
            {dayjs(period.close).format('H[h]mm')}
            <br />
          {/each}
        </div>
      </div>
    {/if}

    {#if troc.society || troc.societyweb}
      <div class="d-flex pt-5">
        <IconLink icon={faUserAlt} opacity />
        <div class="pl-4">
          {#if troc.society}<b>{troc.society}</b>{/if}

          {#if !!troc.societyweb}
            <a
              class="w3-opacity"
              style="line-height: 2.5;"
              href={`http://${troc.societyweb}`}
              target="_blank"
              title="Ouvrir le site internet de l'organisateur"
            >
              {troc.societyweb}
            </a>
          {/if}
        </div>
      </div>
    {/if}
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
      opacity
      size="1.1em"
    />
  </Button>

  {#if displayGetActivity}
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
        opacity
        size="1.1em"
      />
    </Button>
  {/if}

  {#if !!$user && troc.isAdmin}
    <a href={`/admin?trocId=${troc._id}`}>
      <Button text>
        <IconLink icon={faCog} class="mr-2" size="1.2em" />
        Page d'administration
      </Button>
    </a>
  {:else if !!$user && troc.isCashier}
    <a href={`/cashier?trocId=${troc._id}`}>
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
  <div transition:slide|local>
    <UserResum trocId={troc._id} />
  </div>
{/if}

<style>
  .container {
    display: grid;
    grid-template-columns: 50% 50%;
  }
  @media only screen and (max-width: 650px) {
    .container {
      display: block;
    }
  }

  .describe {
    word-wrap: break-word;
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
