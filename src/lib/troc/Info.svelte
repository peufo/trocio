<script lang="ts">
  import { goto } from '@roxi/routify'
  import { slide, fade } from 'svelte/transition'
  import {
    faChild,
    faCubes,
    faTableTennis,
    faStoreAltSlash,
    faMapMarkerAlt,
    faCalendarAlt,
    faUserAlt,
    faCog,
    faCashRegister,
    faChevronRight,
    faSignInAlt,
    faStoreAlt,
    faSignOutAlt,
    faShoppingBasket,
    faTimes,
    faMapMarkedAlt,
  } from '@fortawesome/free-solid-svg-icons'
  import { Button, Chip, Divider } from 'svelte-materialify'
  import dayjs from 'dayjs'
  import relativeTime from 'dayjs/plugin/relativeTime'
  import 'dayjs/locale/fr'
  dayjs.locale('fr')
  dayjs.extend(relativeTime)

  import IconLink from '$lib/util/IconLink.svelte'
  import { user } from '$lib/user/store'
  import ArticleList from '$lib/article/List.svelte'
  import SearchTextField from '$lib/util/SearchTextField.svelte'
  import UserResum from '$lib/troc/UserResum.svelte'
  import Share from '$lib/troc/Share.svelte'
  import type { SubscribeBase, SubscribeLookup, TrocLookup } from 'types'
  import { useMutation } from '@sveltestack/svelte-query'
  import { api, useApi } from '$lib/api'

  export let troc: TrocLookup

  const DESCRIPTION_SIZE = 250
  let sliceDescription = DESCRIPTION_SIZE

  const scheduleIcon = {
    open: faStoreAlt,
    deposit: faSignInAlt,
    recovery: faSignOutAlt,
    sale: faShoppingBasket,
    delete: faTimes,
  }

  $: queryCounters = useApi<
    { trocId: string },
    { articlesCount: number; subscribesCount: number }
  >(['trocs/byId/counters', { trocId: troc._id }])
</script>

<div class="container">
  <div>
    <h6>{troc.name}</h6>

    <!-- Chips infos -->
    <Chip size="small" outlined class="text--secondary">
      <IconLink icon={faChild} size=".7em" />
      <span>
        {$queryCounters.isSuccess ? $queryCounters.data.subscribesCount : '∿'}
      </span>
    </Chip>

    <Chip size="small" outlined class="text--secondary">
      <IconLink icon={faCubes} size=".7em" />
      <span>
        {$queryCounters.isSuccess ? $queryCounters.data.articlesCount : '∿'}
      </span>
    </Chip>

    {#if troc.is_try}
      <Chip size="small" label class="amber darken-3 white-text">
        <IconLink icon={faTableTennis} size=".7em" />
        <span>Entrainement</span>
      </Chip>
    {:else if troc.isClosed}
      <Chip size="small" label class="deep-orange darken-3 white-text">
        <IconLink icon={faStoreAltSlash} size=".7em" />
        <span>Terminé</span>
      </Chip>
    {:else if troc.isOpen}
      <Chip size="small" label class="green darken-1 white-text">
        <IconLink icon={faStoreAlt} size=".7em" />
        <span>En cours</span>
      </Chip>
    {/if}

    <br />

    <p class="describe pt-3">
      {troc.description?.slice(0, sliceDescription)}

      {#if troc.description?.length > sliceDescription}
        <span
          class="showDescription"
          on:click={() => (sliceDescription = Infinity)}
        >
          ...Afficher
        </span>
      {:else if troc.description?.length > DESCRIPTION_SIZE && sliceDescription == Infinity}
        <span
          class="showDescription"
          on:click={() => (sliceDescription = DESCRIPTION_SIZE)}
        >
          Réduire
        </span>
      {/if}
    </p>

    {#if !!$user && troc.subscribe?.validedByUser}
      {#if troc.subscribe?.role === 'admin'}
        <a href={`/admin?trocId=${troc._id}`}>
          <Button depressed>
            administration
            <IconLink icon={faCog} class="ml-2" size="1.2em" opacity />
          </Button>
        </a>
      {:else if troc.subscribe?.role === 'cashier'}
        <a href={`/cashier?trocId=${troc._id}`}>
          <Button depressed>
            Caisse
            <IconLink icon={faCashRegister} class="ml-2" size="1.2em" opacity />
          </Button>
        </a>
      {/if}
    {/if}

    <Share {troc} />
  </div>

  <div>
    {#if troc.address}
      <div class="d-flex pt-5">
        <IconLink icon={faMapMarkerAlt} opacity />
        <div class="pl-4">
          {#each troc.address.split(/, |\n/) as segmentAddress}
            {segmentAddress}<br />
          {/each}
        </div>
      </div>
    {/if}

    {#if troc.schedule?.length}
      <div class="d-flex pt-5">
        <IconLink icon={faCalendarAlt} opacity />
        <div class="pl-4">
          <b>
            {dayjs(
              troc.schedule && troc.schedule[0] && troc.schedule[0].open
            ).fromNow()}
          </b>

          <br />
          {#each troc.schedule as period}
            <IconLink
              icon={(period.name && scheduleIcon[period.name]) ||
                scheduleIcon.open}
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
              style="line-height: 2.5;"
              href={`http://${troc.societyweb}`}
              rel="noreferrer"
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

<style>
  .container {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 1em;
  }
  /*
  @media only screen and (max-width: 650px) {
    .container {
      display: block;
    }
  }
*/
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
