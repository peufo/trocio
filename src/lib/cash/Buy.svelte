<script lang="ts">
  import { Button } from 'svelte-materialify'
  import { useMutation, useQueryClient } from '@sveltestack/svelte-query'

  import Template from '$lib/cash/Template.svelte'
  import Loader from '$lib/util/Loader.svelte'
  import { api } from '$lib/api'
  import type { Article } from 'types'

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
  queryParams={{ ne_exact_providerSubId: subscribeId, exact_statut: 'valided' }}
  placeholder="Articles disponibles"
  message="Sélectionner des articles disponible pour les vendres à un client."
>
  <div slot="actions">
    {#if $querySold.isLoading}
      <Button disabled><Loader /></Button>
    {:else}
      <Button class="primary-color mt-1" on:click={() => $querySold.mutate()}>
        Vendre la sélection
      </Button>
    {/if}
  </div>
</Template>
