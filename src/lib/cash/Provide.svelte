<script lang="ts">
  import { Button, Checkbox, Icon } from 'svelte-materialify'
  import { useMutation, useQueryClient } from '@sveltestack/svelte-query'
  import { mdiPrinter } from '@mdi/js'
  import { faPlus } from '@fortawesome/free-solid-svg-icons'

  import Template from '$lib/cash/Template.svelte'
  import ArticleCreateDialog from '$lib/article/CreateDialog.svelte'
  import Loader from '$lib/util/Loader.svelte'
  import { api } from '$lib/api'
  import { print } from '$lib/utils'
  import type { Article } from 'types'
  import TagsPrint from '$lib/troc/TagsPrint.svelte'
  import { troc } from '$lib/troc/store'
  import IconLink from '$lib/util/IconLink.svelte'

  export let subscribeId: string

  let pendingItems: Article[] = []
  let autoPrint = true
  let articleCreateDialogActive = false
  const queryClient = useQueryClient()
  const queryValid = useMutation(
    (valided: boolean) =>
      api<{ articlesId: string[]; valided: boolean }, Article[]>(
        '/api/articles/valid',
        {
          method: 'post',
          data: { articlesId: pendingItems.map((art) => art._id), valided },
          success: `${pendingItems.length} articles ${
            valided ? 'validés' : 'refusés'
          }`,
        }
      ),
    {
      onSuccess: (articles: Article[]) => {
        if (autoPrint && articles[0].valided) print('providedTags')
        pendingItems = []
        queryClient.invalidateQueries('articles')
        queryClient.invalidateQueries('subscribes/resum')
      },
    }
  )
</script>

<TagsPrint id="providedTags" articles={pendingItems} tag={$troc.tag} />

<ArticleCreateDialog
  {subscribeId}
  bind:active={articleCreateDialogActive}
  on:createArticle={({ detail }) => (pendingItems = [...pendingItems, detail])}
  on:createArticles={({ detail }) =>
    (pendingItems = [...pendingItems, ...detail])}
/>

<Template
  bind:pendingItems
  queryParams={{ exact_providerSubId: subscribeId, exact_statut: 'proposed' }}
  placeholder="Articles proposés"
  canSelectAll
  message="Sélectionner des articles proposés par le client pour les valider ou les refuser."
>
  <div slot="actions-permanent-left">
    <Button depressed dense on:click={() => (articleCreateDialogActive = true)}>
      <IconLink icon={faPlus} opacity size="1.1em" class="mr-2" />
      article
    </Button>
  </div>

  <div slot="actions">
    {#if $queryValid.isLoading}
      <Button disabled><Loader /></Button>
    {:else}
      <Button
        text
        class="red-text mt-1"
        on:click={() => confirm('Etes-vous sur ?') && $queryValid.mutate(false)}
      >
        Refuser
      </Button>
      <Button
        class="primary-color mt-1"
        on:click={() => $queryValid.mutate(true)}
      >
        Valider la sélection
      </Button>
    {/if}
  </div>

  <div
    slot="actions-permanent-right"
    class="ml-4 mt-2"
    title="Impression automatique des étiquettes"
  >
    <Checkbox bind:checked={autoPrint}>
      <Icon path={mdiPrinter} />
    </Checkbox>
  </div>
</Template>
