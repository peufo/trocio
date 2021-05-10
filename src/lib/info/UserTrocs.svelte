<script>
  import { Button, List, ListItem, Icon } from 'svelte-materialify'
  import { faCog, faCashRegister } from '@fortawesome/free-solid-svg-icons'
  import { useInfiniteQuery } from '@sveltestack/svelte-query'
  import { getUserTrocs } from '$lib/api/troc'
  import dayjs from 'dayjs'
  import relativeTime from 'dayjs/plugin/relativeTime'
  import 'dayjs/locale/fr'
  dayjs.locale('fr')
  dayjs.extend(relativeTime)

  import RowsPromise from '$lib/generic/RowsPromise.svelte'

  const queryUserTrocs = useInfiniteQuery('userTrocs', getUserTrocs, {
    getNextPageParam: (lastPage, allPages) => {
      const loadedCount = allPages.map((page) => page.docs).flat().length
      return lastPage.count > loadedCount ? loadedCount : undefined
    },
  })

  $: console.log($queryUserTrocs)

  $: userTrocs = $queryUserTrocs.isLoading
    ? []
    : $queryUserTrocs.data.pages.map((page) => page.docs).flat()

  let moreSubscribedTrocsPromise

  let trocSelected = {}
</script>

<!-- LISTE DES TROCS-->

<div class="header">
  <span class="title">Mes trocs</span>
  <div>
    <a href="/activity/create">
      <Button text>Organiser</Button>
    </a>
    <a href="/activity/search">
      <Button text>Trouver</Button>
    </a>
  </div>
</div>

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
              <!--

            -->
              <a
                href={`/admin?troc=${troc._id}`}
                title="Accéder à la page d'administration"
              >
                <Button icon>
                  <Icon
                    path={faCog.icon[4]}
                    viewWidth={faCog.icon[0]}
                    viewHeight={faCog.icon[1]}
                    size="20px"
                  />
                </Button>
              </a>
            {:else if troc.isCashier}
              <a href={`/cashier?troc=${troc._id}`} title="Accéder à la caisse">
                <Button icon>
                  <Icon
                    path={faCashRegister.icon[4]}
                    viewWidth={faCashRegister.icon[0]}
                    viewHeight={faCashRegister.icon[1]}
                    size="20px"
                  />
                </Button>
              </a>
            {/if}
          </span>
        </ListItem>
      </a>
    {:else}
      Vous n'avez pas encore de troc
    {/each}

    {#if $queryUserTrocs.isFetchingNextPage}
      <RowsPromise listMode twoLine meta />
    {/if}
  </List>

  {#if !$queryUserTrocs.isFetchingNextPage && $queryUserTrocs.hasNextPage}
    <div class="w3-center">
      <Button on:click={() => $queryUserTrocs.fetchNextPage()}
        >Afficher plus</Button
      >
    </div>
  {/if}
{/await}
