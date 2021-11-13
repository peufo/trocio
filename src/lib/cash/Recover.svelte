<script lang="ts">
  import { Button, Icon } from 'svelte-materialify'
  import { useMutation, useQueryClient } from '@sveltestack/svelte-query'
  import printJS from 'print-js'

  import Template from '$lib/cash/Template.svelte'
  import Loader from '$lib/util/Loader.svelte'
  import { api } from '$lib/api'
  import type { Article } from 'types'
  import TagsPrint from '$lib/troc/TagsPrint.svelte'
  import { troc } from '$lib/troc/store'
  import { mdiPrinter } from '@mdi/js'

  export let subscribeId: string

  let pendingItems: Article[] = []
  const queryClient = useQueryClient()
  const queryRecover = useMutation(
    () =>
      api<{ articlesId: string[] }, Article[]>('/api/articles/sold', {
        method: 'post',
        data: { articlesId: pendingItems.map((art) => art._id) },
        success: `${pendingItems.length} articles récupérés`,
      }),
    {
      onSuccess: () => {
        pendingItems = []
        queryClient.invalidateQueries('articles')
        queryClient.invalidateQueries('subscribes/resum')
      },
    }
  )

  function print() {
    printJS({
      printable: 'recoverTags',
      type: 'html',
      targetStyles: ['*'],
    })
  }
</script>

<TagsPrint id="recoverTags" articles={pendingItems} tag={$troc.tag} />

<Template
  bind:pendingItems
  queryParams={{ exact_providerSubId: subscribeId, exact_statut: 'valided' }}
  placeholder="Articles validés"
  canSelectAll
  message="Sélectionner des articles invendus pour les rendre au client."
>
  <div slot="actions">
    {#if $queryRecover.isLoading}
      <Button disabled><Loader /></Button>
    {:else}
      <Button
        fab
        depressed
        size="small"
        title="Imprimer les étiquettes de la sélection"
        on:click={print}
      >
        <Icon path={mdiPrinter} />
      </Button>

      <Button
        class="primary-color mt-1"
        on:click={() => $queryRecover.mutate()}
      >
        Récupérer la sélection
      </Button>
    {/if}
  </div>
</Template>
