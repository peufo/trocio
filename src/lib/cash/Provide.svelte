<script lang="ts">
  import { useMutation, useQueryClient } from '@sveltestack/svelte-query'
  import { mdiPrinterCheck, mdiPrinterOff } from '@mdi/js'

  import { Button, Icon } from '$material'
  import Template from '$lib/cash/Template.svelte'
  import ArticleEditDialog from '$lib/article/EditDialog.svelte'
  import Loader from '$lib/util/Loader.svelte'
  import { api } from '$lib/api'
  import type { Article } from 'types'
  import TagsPrint from '$lib/troc/TagsPrint.svelte'
  import { troc } from '$lib/troc/store'
  import notify from '$lib/notify'

  export let subscribeId: string
  let template: Template
  let tagsPrint: TagsPrint

  let pendingItems: Article[] = []
  let autoPrint = true
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
      onSuccess: async (articles: Article[]) => {
        if (autoPrint && articles[0].valided) await tagsPrint.print()
        pendingItems = []
        queryClient.invalidateQueries('articles')
        queryClient.invalidateQueries('subscribes/resum')
        template.closeSelection()
      },
    }
  )

  function toggleAutoPrint() {
    autoPrint = !autoPrint
    notify.info(
      `Impression automatique des étiquettes ${autoPrint ? '' : 'dés'}activé`
    )
  }
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
  queryParams={{ exact_providerSubId: subscribeId, exact_state: 'proposed' }}
  placeholder="Articles proposés"
  canSelectAll
  disableScanner
  message="Sélectionner des articles proposés par le client pour les valider ou les refuser."
>
  <div slot="options-selection" class="d-flex align-center" style="gap: 1em;">
    <div title="Impression automatique des étiquettes">
      <Button fab size="small" depressed on:click={toggleAutoPrint}>
        <Icon path={autoPrint ? mdiPrinterCheck : mdiPrinterOff} />
      </Button>
    </div>
  </div>

  <div slot="actions-search">
    <ArticleEditDialog
      icon
      actionName="Ajouter"
      {subscribeId}
      on:done={({ detail }) => (pendingItems = [...pendingItems, detail])}
      on:doneList={({ detail }) =>
        (pendingItems = [...pendingItems, ...detail])}
    />
  </div>

  <div slot="actions-selection">
    {#if $queryValid.isLoading}
      <Button disabled><Loader /></Button>
    {:else}
      <Button
        text
        class="red-text"
        on:click={() => confirm('Etes-vous sur ?') && $queryValid.mutate(false)}
      >
        Refuser
      </Button>
      <Button class="primary-color" on:click={() => $queryValid.mutate(true)}>
        Valider
        {pendingItems.length > 1
          ? `les ${pendingItems.length} articles`
          : `l'article`}
      </Button>
    {/if}
  </div>
</Template>
