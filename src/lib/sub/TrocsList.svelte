<script lang="ts">
  /**
   * Liste les trocs auxquels l'utilisateur est abonné
   */

  import { List, ListItem, Chip, Button } from '$material'
  import { faCog, faCashRegister } from '@fortawesome/free-solid-svg-icons'
  import dayjs from 'dayjs'
  import relativeTime from 'dayjs/plugin/relativeTime'
  import 'dayjs/locale/fr'
  import { params } from '@roxi/routify'

  import IconLink from '$lib/util/IconLink.svelte'
  import Loader from '$lib/util/Loader.svelte'
  import { useInfinitApi } from '$lib/api'
  import type { SubscribeLookup } from 'types'
  import { isMobile } from '$lib/store/layout'

  dayjs.locale('fr')
  dayjs.extend(relativeTime)

  export let offset = 0

  // const querySubscribes = useSubscribedTrocs()
  const query = useInfinitApi<{}, SubscribeLookup[]>(['subscribes/me', {}])
  $: subscribes = $query.data ? $query.data.pages.flat() : []
</script>

{#if $query.isSuccess}
  <List dense={!$isMobile}>
    {#each subscribes as { troc }}
      <a href={`/trocs/${troc._id}`}>
        <ListItem
          on:click
          active={$params.trocId === troc._id}
          style="padding-left: {offset}px;"
        >
          {troc.name}
          {#if troc.is_try}
            <Chip size="x-small" label outlined class="orange-text ml-2">
              <span>Entrainement</span>
            </Chip>
          {:else if troc.isClosed}
            <Chip size="x-small" label outlined class="deep-orange-text ml-2">
              <span>Terminé</span>
            </Chip>
          {:else if troc.isOpen}
            <Chip size="x-small" label outlined class="green-text">
              <span>En cours</span>
            </Chip>
          {/if}
          <span slot="subtitle">
            {#if !troc.is_try}
              {dayjs(
                troc.schedule && troc.schedule[0] && troc.schedule[0].open
              ).fromNow()}
              <br />
            {/if}
            {troc.address}
          </span>
          <span slot="append">
            {#if troc.isAdmin}
              <IconLink
                href={`/admin?trocId=${troc._id}`}
                icon={faCog}
                size="20px"
                opacity
              />
            {:else if troc.isCashier}
              <IconLink
                href={`/cashier?trocId=${troc._id}`}
                icon={faCashRegister}
                size="20px"
                opacity
              />
            {/if}
          </span>
        </ListItem>
      </a>
    {:else}
      <div class="text--disabled text-center">
        Vous n'avez pas encore de troc
      </div>
    {/each}
  </List>
{:else if $query.isError}
  <ListItem disabled>Oups, une erreur est survenue !</ListItem>
{/if}

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
