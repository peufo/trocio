<script lang="ts">
  /**
   * Liste les trocs auxquels l'utilisateur est abonné
   */

  import { List, ListItem, Chip } from 'svelte-materialify'
  import { faCog, faCashRegister } from '@fortawesome/free-solid-svg-icons'
  import dayjs from 'dayjs'
  import relativeTime from 'dayjs/plugin/relativeTime'
  import 'dayjs/locale/fr'
  import { params } from '@roxi/routify'

  import IconLink from '$lib/util/IconLink.svelte'
  import Loader from '$lib/util/Loader.svelte'
  import { useInfinitApi } from '$lib/api'
  import type { SubscribeLookup } from 'types'

  dayjs.locale('fr')
  dayjs.extend(relativeTime)

  export let offset = 0

  // const querySubscribes = useSubscribedTrocs()
  const querySubscribes = useInfinitApi<{}, SubscribeLookup[]>([
    'subscribes/me',
    {},
  ])
  $: subscribes = $querySubscribes.data
    ? $querySubscribes.data.pages.flat()
    : []
</script>

{#if $querySubscribes.isSuccess}
  <List dense>
    {#each subscribes as { troc }}
      <a href={`/trocs/${troc._id}`}>
        <ListItem
          on:click
          active={$params.trocId === troc._id}
          style="padding-left: {offset}px;"
        >
          {troc.name}
          {#if troc.is_try}
            <Chip size="x-small" label class="amber darken-3 white-text">
              <span>Entrainement</span>
            </Chip>
          {:else if troc.isClosed}
            <Chip size="x-small" label class="deep-orange darken-3 white-text">
              <span>Terminé</span>
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
{:else if $querySubscribes.isError}
  <ListItem disabled>Oups, une erreur est survenue !</ListItem>
{/if}

{#if $querySubscribes.isFetching}
  <ListItem disabled class="pl-16">
    <Loader />
  </ListItem>
{:else if $querySubscribes.hasNextPage}
  <ListItem
    on:click={() =>
      !$querySubscribes.isFetchingNextPage && $querySubscribes.fetchNextPage()}
    style="padding-left: {offset}px;"
  >
    {#if !$querySubscribes.isFetchingNextPage}
      Afficher plus
    {:else}
      <Loader />
    {/if}
  </ListItem>
{/if}
