<script lang="ts">
  import { params } from '@roxi/routify'
  import { useApi, useInfinitApi } from '$lib/api'
  import Loader from '$lib/util/Loader.svelte'

  import type { SubscribeLookup } from 'types'

  let searchValue = ''

  interface QueryParams {
    trocId: string
    q?: string
  }

  $: query = useInfinitApi<QueryParams, SubscribeLookup[]>([
    'subscribes',
    { trocId: $params.trocId, q: searchValue },
  ])
</script>

<div class="container">
  <h6 class="mb-5">Gestion des participants</h6>
</div>

<input type="text" bind:value={searchValue} placeholder="Recherche" />

{#if $query.isError}
  <pre>{$query.error}</pre>
{:else if $query.isLoading}
  <Loader />
{:else if $query.data}
  <ul>
    {#each $query.data.pages as page}
      {#each page as sub}
        <li>
          {sub.user.name}
        </li>
      {/each}
    {/each}
  </ul>
{/if}

<button on:click={() => $query.fetchNextPage()}>Encore</button>
