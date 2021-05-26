<script>
  import { List, ListItem } from 'svelte-materialify'
  import { faCog, faCashRegister } from '@fortawesome/free-solid-svg-icons'
  import dayjs from 'dayjs'
  import relativeTime from 'dayjs/plugin/relativeTime'
  import 'dayjs/locale/fr'

  import IconLink from '$lib/util/IconLink.svelte'
  import Loader from '$lib/util/Loader.svelte'
  import { useSubscribedTrocs } from '$lib/troc/store'

  dayjs.locale('fr')
  dayjs.extend(relativeTime)

  export let offset = 0

  const queryUserTrocs = useSubscribedTrocs()
  $: userTrocs = $queryUserTrocs.data ? $queryUserTrocs.data.pages.flat() : []

  let trocSelected = {}
</script>

{#await $queryUserTrocs.isLoading}
  <List twoLine>
    <ListItem disabled>
      <Loader />
    </ListItem>
  </List>
{:then}
  <List dense>
    {#each userTrocs as troc}
      <a href={`/trocs/${troc._id}`}>
        <ListItem
          active={trocSelected && trocSelected._id === troc._id}
          style="padding-left: {offset}px;"
        >
          {troc.name}
          {#if troc.is_try}
            <span class="warning">Entrainement</span>
          {/if}
          {#if troc.isClosed}
            <span class="warning">Terminé</span>
          {/if}
          <span slot="subtitle">
            {dayjs(
              troc.schedule && troc.schedule[0] && troc.schedule[0].open
            ).fromNow()}
            <br />
            {troc.description.slice(0, 124)}
          </span>
          <span slot="append">
            {#if troc.isAdmin}
              <IconLink
                href={`/admin?troc=${troc._id}`}
                icon={faCog}
                size="20px"
                style="opacity: .6;"
              />
            {:else if troc.isCashier}
              <IconLink
                href={`/cashier?troc=${troc._id}`}
                icon={faCashRegister}
                size="20px"
              />
            {/if}
          </span>
        </ListItem>
      </a>
    {:else}
      Vous n'avez pas encore de troc
    {/each}

    {#if $queryUserTrocs.hasNextPage}
      <ListItem
        on:click={() =>
          !$queryUserTrocs.isFetchingNextPage &&
          $queryUserTrocs.fetchNextPage()}
        style="padding-left: {offset}px;"
      >
        {#if !$queryUserTrocs.isFetchingNextPage}
          Afficher plus
        {:else}
          <Loader />
        {/if}
      </ListItem>
    {/if}
  </List>
{/await}
