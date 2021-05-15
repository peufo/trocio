<script>
  import { Button, List, ListItem, Icon } from 'svelte-materialify'
  import {
    faCog,
    faCashRegister,
    faSnowflake,
  } from '@fortawesome/free-solid-svg-icons'
  import { useInfiniteQuery } from '@sveltestack/svelte-query'
  import IconLink from '$lib/util/IconLink.svelte'
  import { getUserTrocs } from '$lib/api/troc'
  import dayjs from 'dayjs'
  import relativeTime from 'dayjs/plugin/relativeTime'
  import 'dayjs/locale/fr'
  dayjs.locale('fr')
  dayjs.extend(relativeTime)

  import RowsPromise from '$lib/util/RowsPromise.svelte'

  const queryUserTrocs = useInfiniteQuery('userTrocs', getUserTrocs, {
    getNextPageParam: (lastPage, allPages) => {
      const loadedCount = allPages.map((page) => page.docs).flat().length
      return lastPage.count > loadedCount ? loadedCount : undefined
    },
  })

  $: userTrocs = $queryUserTrocs.isLoading
    ? []
    : $queryUserTrocs.data.pages.map((page) => page.docs).flat()

  let moreSubscribedTrocsPromise

  let trocSelected = {}
</script>

<!-- LISTE DES TROCS-->

<div>
  <span class="title">Mes trocs</span>

  <a href="/activity/create">
    <Button text>Organiser</Button>
  </a>
  <a href="/activity/search">
    <Button text>Trouver</Button>
  </a>
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
        <Button on:click={() => $queryUserTrocs.fetchNextPage()}
          >Afficher plus</Button
        >
      {:else}
        <Button disabled>
          <Icon
            spin
            path={faSnowflake.icon[4]}
            viewWidth={faSnowflake.icon[0]}
            viewHeight={faSnowflake.icon[1]}
          />
        </Button>
      {/if}
    </div>
  {/if}
{/await}
