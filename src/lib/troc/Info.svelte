<script lang="ts">
  import { goto } from '@roxi/routify'
  import { slide } from 'svelte/transition'
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
  import ArticleSearchTextField from '$lib/article/SearchTextField.svelte'
  import UserResum from '$lib/troc/UserResum.svelte'
  import Share from '$lib/troc/Share.svelte'
  import { useCreateSubscribe } from '$lib/troc/store'
  import type { TrocLookup } from 'types'

  export let troc: TrocLookup

  export let articleSearch = ''
  export let activityOpen = false

  const DESCRIPTION_SIZE = 250
  let sliceDescription = DESCRIPTION_SIZE

  const scheduleIcon = {
    open: faStoreAlt,
    deposit: faSignInAlt,
    recovery: faSignOutAlt,
    sale: faShoppingBasket,
  }
  const createSubscribe = useCreateSubscribe()

  function handleClickActivity() {
    if (!$user)
      return $goto('/login', {
        callback: `/trocs/${troc._id}`,
      })
    activityOpen = !activityOpen
    if (!troc.role) {
      $createSubscribe.mutate(
        { troc: troc._id },
        {
          onSuccess: (subscribe) => {
            // TODO: manage subscribe already exist
            if (subscribe._id) troc.role = 'basic'
          },
        }
      )
    }
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
  </div>

  <div class="pl-5 pb-5">
    {#if troc.address}
      <div class="d-flex pt-5">
        <IconLink icon={faMapMarkerAlt} opacity />
        <div class="pl-4">
          {#each troc.address.split(/, |\n/) as segmentAddress}
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
    {/if}

    {#if troc.schedule}
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

<Divider />

<div
  class="d-flex flex-wrap align-center justify-space-between"
  style="min-height: 56px;"
>
  {#if !activityOpen}
    <ArticleSearchTextField bind:search={articleSearch} class="mr-1 ml-1" />
  {/if}

  <div class="flex-grow-1" />
  {#if !!$user && troc.role === 'admin'}
    <a href={`/admin?trocId=${troc._id}`}>
      <Button depressed class="mr-1 ml-1">
        administration
        <IconLink icon={faCog} class="ml-2" size="1.2em" opacity />
      </Button>
    </a>
  {:else if !!$user && troc.role === 'cashier'}
    <a href={`/cashier?trocId=${troc._id}`}>
      <Button depressed class="ml-2">
        Caisse
        <IconLink
          icon={faCashRegister}
          class="mr-1 ml-1"
          size="1.2em"
          opacity
        />
      </Button>
    </a>
  {/if}
  <Button on:click={handleClickActivity} depressed class="mr-1 ml-1">
    {troc.role ? 'Mon activité' : 'Participer au troc'}
    <IconLink
      icon={faChevronRight}
      rotate={activityOpen ? 90 : 0}
      class="ml-2"
      opacity
      size="1.1em"
    />
  </Button>

  <Share {troc} class="mr-1 ml-1" />
</div>

{#if activityOpen}
  <div transition:slide|local>
    <UserResum trocId={troc._id} userId={$user._id} />
    <Divider />
  </div>
{/if}

{#if activityOpen}
  <ArticleSearchTextField bind:search={articleSearch} class="pt-4" />
{/if}

<ArticleList
  trocId={troc._id}
  currency={troc.currency}
  search={articleSearch}
/>

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
