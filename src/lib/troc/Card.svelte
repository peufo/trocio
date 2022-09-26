<script lang="ts">
  import {
    faChild,
    faCubes,
    faTableTennis,
    faStoreAltSlash,
    faMapMarkerAlt,
    faCalendarAlt,
    faCog,
    faCashRegister,
    faSignInAlt,
    faStoreAlt,
    faSignOutAlt,
    faShoppingBasket,
    faTimes,
    faUserTie,
  } from '@fortawesome/free-solid-svg-icons'
  import {
    Card,
    CardTitle,
    CardSubtitle,
    CardText,
    CardActions,
    Button,
    Chip,
    Icon,
  } from 'svelte-materialify/src'
  import dayjs from 'dayjs'
  import relativeTime from 'dayjs/plugin/relativeTime'
  import 'dayjs/locale/fr'
  import { mdiPhone, mdiWeb, mdiMail } from '@mdi/js'

  import IconLink from '$lib/util/IconLink.svelte'
  import { user } from '$lib/user/store'
  import Share from '$lib/troc/Share.svelte'
  import type { TrocLookup } from 'types'
  import { useApi } from '$lib/api'
  import { faEnvelope } from '@fortawesome/free-regular-svg-icons'

  export let troc: TrocLookup
  export let clickable = false
  export let hideAdminButton = false
  let klass = ''
  export { klass as class }
  export let style = ''

  dayjs.locale('fr')
  dayjs.extend(relativeTime)

  const DESCRIPTION_SIZE = 250
  let sliceDescription = DESCRIPTION_SIZE

  const SCHEDULE = {
    open: { icon: faStoreAlt, title: 'Ouverture du troc' },
    deposit: { icon: faSignInAlt, title: 'Dépot des articles' },
    recovery: { icon: faSignOutAlt, title: 'Récupération des articles' },
    sale: { icon: faShoppingBasket, title: 'Ouverture des ventes' },
    delete: { icon: faTimes, title: `Cette option n'a pas de sens ici` },
  }

  $: queryCounters = useApi<
    { trocId: string },
    { articlesCount: number; subscribesCount: number }
  >(['trocs/byId/counters', { trocId: troc._id }])
</script>

<Card hover={clickable} class={klass} {style}>
  <CardTitle>{troc.name}</CardTitle>
  <CardSubtitle>
    <Chip size="small" outlined class="text--secondary">
      <IconLink icon={faChild} size=".7em" />
      <span title="Nombre de participants">
        {$queryCounters.isSuccess ? $queryCounters.data.subscribesCount : '∿'}
      </span>
    </Chip>

    <Chip size="small" outlined class="text--secondary">
      <IconLink icon={faCubes} size=".7em" />
      <span title="Nombre d'articles">
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
            <div class="pl-4 d-flex flex-column" style="gap: 4px;">
              <b>
                {dayjs(
                  troc.schedule && troc.schedule[0] && troc.schedule[0].open
                ).fromNow()}
              </b>

              {#each troc.schedule as period}
                <div title={(period.name && SCHEDULE[period.name].title) || ''}>
                  <IconLink
                    icon={(period.name && SCHEDULE[period.name].icon) ||
                      SCHEDULE.open.icon}
                    size="1.1em"
                    class="mr-1"
                  />
                  {dayjs(period.open).format('dddd DD.MM.YY [d]e H[h]mm à ')}
                  {dayjs(period.close).format('H[h]mm')}
                </div>
              {/each}
            </div>
          </div>
        {/if}

        {#if troc.society || troc.societyweb || troc.societyMail || troc.societyPhone}
          <div class="d-flex align-start">
            <IconLink icon={faUserTie} opacity />
            <div class="pl-4 d-flex flex-column" style="gap: 4px;">
              {#if !!troc.society}
                <b>{troc.society}</b>
              {/if}

              {#if !!troc.societyweb}
                <div>
                  <a
                    href="https://{troc.societyweb.replace(/^https?:\/\//, '')}"
                    rel="noreferrer"
                    target="_blank"
                    title="Ouvrir le site internet de l'organisateur"
                  >
                    <Icon path={mdiWeb} size="1.1em" class="mr-1" />
                    {troc.societyweb.replace(/^https?:\/\//, '')}
                  </a>
                </div>
              {/if}

              {#if !!troc.societyMail}
                <div>
                  <a
                    href="mailto:{troc.societyMail}?subject={troc.name}"
                    rel="noreferrer"
                    target="_blank"
                    title="Contacter l'organisateur par email"
                  >
                    <IconLink icon={faEnvelope} size="1.1em" class="mr-1" />
                    {troc.societyMail}
                  </a>
                </div>
              {/if}

              {#if !!troc.societyPhone}
                <div>
                  <a
                    href="tel:{troc.societyPhone}"
                    rel="noreferrer"
                    target="_blank"
                    title="Contacter l'organisateur par téléphone"
                  >
                    <Icon path={mdiPhone} size="1.1em" class="mr-1" />
                    {troc.societyPhone}
                  </a>
                </div>
              {/if}
            </div>
          </div>
        {/if}
      </div>
    </div>
  </CardText>

  <CardActions class="flex-wrap" style="gap: 0.5em;">
    <Share {troc} />
    <slot name="card-actions" />

    <div class="flex-grow-1" />

    {#if !hideAdminButton}
      {#if !!$user && troc.subscribe?.validedByUser}
        {#if troc.subscribe?.role === 'admin'}
          <a href={`/admin?trocId=${troc._id}`}>
            <Button depressed class="secondary-color">
              administration
              <IconLink icon={faCog} class="ml-2" size="1.2em" opacity />
            </Button>
          </a>
        {:else if troc.subscribe?.role === 'cashier'}
          <a href={`/cashier?trocId=${troc._id}`}>
            <Button depressed class="secondary-color">
              Caisse
              <IconLink
                icon={faCashRegister}
                class="ml-2"
                size="1.2em"
                opacity
              />
            </Button>
          </a>
        {/if}
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
    gap: 20px;
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
