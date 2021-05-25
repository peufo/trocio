<script>
  import { Button, List, ListItem } from 'svelte-materialify'
  import { faCog, faCashRegister } from '@fortawesome/free-solid-svg-icons'
  import dayjs from 'dayjs'
  import relativeTime from 'dayjs/plugin/relativeTime'
  import 'dayjs/locale/fr'

  import IconLink from '$lib/util/IconLink.svelte'
  import Loader from '$lib/util/Loader.svelte'
  import { useSubscribedTrocs } from '$lib/troc/store'

  dayjs.locale('fr')
  dayjs.extend(relativeTime)

  import RowsPromise from '$lib/util/RowsPromise.svelte'

  const queryUserTrocs = useSubscribedTrocs()
  $: userTrocs = $queryUserTrocs.data ? $queryUserTrocs.data.pages.flat() : []

  let trocSelected = {}
</script>

{#await $queryUserTrocs.isLoading}
  <List twoLine>
    <RowsPromise listMode twoLine meta />
  </List>
{:then}
  <List>
    {#each userTrocs as troc}
      <a href={`/activity/detail?troc=${troc._id}`}>
        <ListItem
          active={trocSelected && trocSelected._id === troc._id}
          title={troc.address}
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
                tip="Accéder à la page d'administration"
                icon={faCog}
                size="20px"
              />
            {:else if troc.isCashier}
              <IconLink
                href={`/cashier?troc=${troc._id}`}
                tip="Accéder à la caisse"
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
  </List>

  {#if $queryUserTrocs.hasNextPage}
    <div class="centered">
      {#if !$queryUserTrocs.isFetchingNextPage}
        <Button on:click={() => $queryUserTrocs.fetchNextPage()}>
          Afficher plus
        </Button>
      {:else}
        <Button disabled>
          <Loader />
        </Button>
      {/if}
    </div>
  {/if}
{/await}
