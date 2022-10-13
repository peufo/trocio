<script lang="ts">
  /**
   * Liste abonement de l'utilisateur
   */

  import { Chip, Button } from '$material'
  import {
    faCog,
    faCashRegister,
    faMapMarkerAlt,
    faUserTie,
  } from '@fortawesome/free-solid-svg-icons'
  import dayjs from 'dayjs'
  import relativeTime from 'dayjs/plugin/relativeTime'
  import 'dayjs/locale/fr'
  import { params } from '@roxi/routify'

  import IconLink from '$lib/util/IconLink.svelte'
  import Loader from '$lib/util/Loader.svelte'
  import { useInfinitApi } from '$lib/api'
  import type { SubscribeLookup } from 'types'
  import { faCalendarAlt } from '@fortawesome/free-regular-svg-icons'

  dayjs.locale('fr')
  dayjs.extend(relativeTime)

  // const querySubscribes = useSubscribedTrocs()
  const query = useInfinitApi<{}, SubscribeLookup[]>(['subscribes/me', {}])
  $: subscribes = $query.data ? $query.data.pages.flat() : []
</script>

<div class="list-container">
  {#if $query.isSuccess}
    {#each subscribes as sub}
      <div
        on:click
        class="simple-card item"
        class:active={$params.trocId === sub.troc._id}
      >
        <a href={`/trocs/${sub.troc._id}`} class="item-link"><span /></a>
        <div class="d-flex" style="gap: 1em;">
          <div style="padding-top: 2px;">{sub.troc.name}</div>
          <div class="flex-grow-1" />
          <div style="translate: 4px 0px;">
            {#if sub.troc.is_try}
              <Chip size="small" label class="orange-text">
                <span>Entrainement</span>
              </Chip>
            {:else if sub.troc.isClosed}
              <Chip size="small" label class="deep-orange-text">
                <span>Terminé</span>
              </Chip>
            {:else if sub.troc.isOpen}
              <Chip size="small" label class="green-text">
                <span>En cours</span>
              </Chip>
            {/if}
          </div>
        </div>

        <div class="d-flex mt-1 text-caption">
          <div
            class="flex-grow-1 d-flex flex-column"
            style="gap: 0.6em; line-height: 1em;"
          >
            {#if !sub.troc.is_try}
              <div class="detail mt-1">
                <IconLink icon={faMapMarkerAlt} opacity size="1.1em" />
                <div>{sub.troc.address}</div>
              </div>
              <div class="detail">
                <IconLink icon={faCalendarAlt} opacity size="1.1em" />
                <div>{dayjs(sub.troc.schedule?.[0]?.open).fromNow()}</div>
              </div>
            {/if}

            <div class="detail mt-1">
              <IconLink icon={faUserTie} opacity size="1.1em" />
              <div>{sub.troc.society || '-'}</div>
            </div>
          </div>

          <div class="d-flex flex-column">
            <div class="flex-grow-1" />
            {#if sub.role === 'admin'}
              <IconLink
                href={`/admin?trocId=${sub.troc._id}`}
                icon={faCog}
                size="20px"
                opacity
              />
            {:else if sub.role === 'cashier'}
              <IconLink
                href={`/cashier?trocId=${sub.troc._id}`}
                icon={faCashRegister}
                size="20px"
                opacity
              />
            {/if}
          </div>
        </div>
      </div>
    {:else}
      <div class="text--disabled text-center">
        Vous n'avez pas encore de troc
      </div>
    {/each}
  {:else if $query.isError}
    <div>Oups, une erreur est survenue !</div>
  {/if}
</div>

{#if $query.hasNextPage || $query.isFetching || $query.isFetchingNextPage}
  <div class="centered pb-4">
    <Button
      on:click={() => !$query.isFetchingNextPage && $query.fetchNextPage()}
      disabled={$query.isFetching || $query.isFetchingNextPage}
      depressed
    >
      {#if $query.isFetching || $query.isFetchingNextPage}
        <Loader />
      {:else}
        Afficher plus
      {/if}
    </Button>
  </div>
{/if}

<style lang="scss">
  .list-container {
    flex-grow: 1;
    display: flex;
    flex-direction: column;
    gap: 4px;
    border-radius: 8px;
    overflow-y: auto;
    padding: 4px;

    .item {
      position: relative;
      padding: 4px 8px;
      padding-bottom: 8px;
      line-height: 1.3em;
      background: var(--theme-cards);
      min-height: 60px;
    }

    .item .item-link {
      position: absolute;
      inset: 0;
    }

    .item:hover {
      background: var(--theme-tables-hover);
    }
  }

  .detail {
    display: flex;
    gap: 1em;
  }
</style>
