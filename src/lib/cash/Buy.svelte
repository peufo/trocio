<script lang="ts">
  import { Button } from '$material'
  import { useMutation, useQueryClient } from '@sveltestack/svelte-query'

  import Template from '$lib/cash/Template.svelte'
  import Loader from '$lib/util/Loader.svelte'
  import { api } from '$lib/api'
  import type { Article } from 'types'
  import { troc } from '$lib/troc/store'

  export let subscribeId: string

  let pendingItems: Article[] = []
  const queryClient = useQueryClient()
  const querySold = useMutation(
    () =>
      api<{ articlesId: string[]; buyerSubId: string }, Article[]>(
        '/api/articles/sold',
        {
          method: 'post',
          data: {
            articlesId: pendingItems.map((art) => art._id),
            buyerSubId: subscribeId,
          },
          success: `${pendingItems.length} articles vendus`,
        }
      ),
    {
      onSuccess: () => {
        pendingItems = []
        queryClient.invalidateQueries('articles')
        queryClient.invalidateQueries('subscribes/resum')
      },
    }
  )
</script>

<Template
  bind:pendingItems
  queryParams={{
    exact_trocId: $troc._id,
    ne_exact_providerSubId: subscribeId,
    exact_state: 'valided',
  }}
  placeholder="Articles disponibles"
  message="Sélectionner des articles disponible pour les vendres au client."
>
  <div slot="actions-selection">
    {#if $querySold.isLoading}
      <Button disabled><Loader /></Button>
    {:else}
      <Button class="primary-color" on:click={() => $querySold.mutate()}>
        Vendre
        {pendingItems.length > 1
          ? `les ${pendingItems.length} articles`
          : `l'article`}
      </Button>
    {/if}
  </div>
</Template>
