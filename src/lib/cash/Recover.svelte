<script lang="ts">
  import { Button, Icon } from '$material'
  import { useMutation, useQueryClient } from '@sveltestack/svelte-query'

  import Template from '$lib/cash/Template.svelte'
  import Loader from '$lib/util/Loader.svelte'
  import { api } from '$lib/api'
  import type { Article } from 'types'
  import TagsPrint from '$lib/troc/TagsPrint.svelte'
  import { troc } from '$lib/troc/store'
  import { mdiTagOutline } from '@mdi/js'

  export let subscribeId: string
  let template: Template
  let tagsPrint: TagsPrint

  export const selectArticleId = (articleId: string) =>
    template.selectArticleId(articleId)

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
        template.closeSelection()
      },
    }
  )
</script>

<TagsPrint
  bind:this={tagsPrint}
  articles={pendingItems}
  tag={$troc.tag}
  currency={$troc.currency}
/>

<Template
  bind:this={template}
  bind:pendingItems
  queryParams={{
    exact_trocId: $troc._id,
    exact_providerSubId: subscribeId,
    exact_state: 'valided',
  }}
  placeholder="Articles validés"
  canSelectAll
  message="Sélectionner des articles invendus pour les rendre au client."
>
  <div slot="actions-selection" class="d-flex align-center" style="gap: 4px;">
    {#if $queryRecover.isLoading}
      <Button disabled><Loader /></Button>
    {:else}
      <Button
        fab
        outlined
        size="small"
        title="Imprimer les étiquettes de la sélection"
        class="secondary-color"
        on:click={() => tagsPrint.print()}
      >
        <Icon path={mdiTagOutline} />
      </Button>

      <Button class="primary-color" on:click={() => $queryRecover.mutate()}>
        Rendre
        {pendingItems.length > 1
          ? `les ${pendingItems.length} articles`
          : `l'article`}
      </Button>
    {/if}
  </div>
</Template>
