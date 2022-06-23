<script lang="ts">
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
    faSignInAlt,
    faStoreAlt,
    faSignOutAlt,
    faShoppingBasket,
    faTimes,
  } from '@fortawesome/free-solid-svg-icons'
  import {
    Card,
    CardTitle,
    CardSubtitle,
    CardText,
    CardActions,
    Button,
    Chip,
  } from 'svelte-materialify'
  import dayjs from 'dayjs'
  import relativeTime from 'dayjs/plugin/relativeTime'
  import 'dayjs/locale/fr'
  dayjs.locale('fr')
  dayjs.extend(relativeTime)

  import IconLink from '$lib/util/IconLink.svelte'
  import { user } from '$lib/user/store'

  import Share from '$lib/troc/Share.svelte'
  import type { TrocLookup } from 'types'
  import { useApi } from '$lib/api'

  export let troc: TrocLookup
  export let clickable = false

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

<Card hover={clickable}>
  <CardTitle>{troc.name}</CardTitle>
  <CardSubtitle>
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
  </CardSubtitle>
  <CardText>
    <div class="card-content">
      <!-- Description -->
      <div>
        <p style="word-wrap: break-word;">
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

      <!-- Lieu, date et organisateur -->
      <div class="card-info-pratice">
        {#if troc.address}
          <div class="d-flex align-start">
            <IconLink icon={faMapMarkerAlt} opacity />
            <div class="pl-4">
              {#each troc.address.split(/, |\n/) as segmentAddress}
                {segmentAddress}<br />
              {/each}
            </div>
          </div>
        {/if}

        {#if troc.schedule?.length}
          <div class="d-flex align-start">
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
          <div class="d-flex align-start">
            <IconLink icon={faUserAlt} opacity />
            <div class="pl-4">
              {#if !!troc.society}
                <b>{troc.society}</b>
              {/if}

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
  </CardText>

  <CardActions class="flex-wrap" style="gap: 0.5em;">
    <Share {troc} />

    <div class="flex-grow-1" />
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
  </CardActions>
</Card>

<style>
  .card-content {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 1em;
  }

  .card-info-pratice {
    display: flex;
    flex-direction: column;
    gap: 10px;
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
