<script lang="ts">
  import { slide } from 'svelte/transition'
  import { Dialog, Divider, Button, Icon } from '$material'
  import { useMutation, useQueryClient } from '@sveltestack/svelte-query'
  import { mdiPrinter } from '@mdi/js'
  import { faHistory } from '@fortawesome/free-solid-svg-icons'

  import ArticleEditDialog from '$lib/article/EditDialog.svelte'
  import { renderAmount } from '$lib/utils'
  import TagsPrint from '$lib/troc/TagsPrint.svelte'
  import type {
    Article,
    ArticleCorrection,
    ArticleCorrectionsLookup,
    ArticleLookup,
    ArticleState,
  } from 'types'
  import { getStateLabel } from '$lib/utils'
  import { troc } from '$lib/troc/store'
  import { api, useApi } from '$lib/api'
  import Loader from '$lib/util/Loader.svelte'
  import IconLink from '$lib/util/IconLink.svelte'
  import ArticleStateHistoric from '$lib/article/StateHistoric.svelte'

  export let active = false
  export let article: ArticleLookup | undefined
  export let modeAdmin = false

  let tagsPrint: TagsPrint

  const queryClient = useQueryClient()
  const intl = new Intl.DateTimeFormat(undefined, {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
  })
  let correctionsVisible = false

  $: if (!active) correctionsVisible = false
  $: queryCorrections = article
    ? useApi<{ articleId: string }, ArticleCorrectionsLookup>([
        'articles/corrections',
        { articleId: article?._id },
      ])
    : null

  const queryDelete = useMutation(
    (data: { articleId: string }) =>
      api('/api/articles', {
        method: 'delete',
        data,
        success: 'Article supprimé',
      }),
    {
      onSuccess: () => {
        article = undefined
        active = false
        queryClient.invalidateQueries('articles')
        queryClient.invalidateQueries('subscribes/resum')
      },
    }
  )

  const queryCancelEvent = useMutation(
    (eventName: ArticleState) =>
      api<{ articleId: string; eventName: ArticleState }, ArticleLookup>(
        '/api/articles/cancel-event',
        {
          method: 'post',
          data: { eventName, articleId: article?._id },
          success: 'Evenement de correction annulé',
        }
      ),
    {
      onSuccess: (articleUpdated) => {
        // TODO: lookup subscribe
        article = articleUpdated
        queryClient.invalidateQueries('articles')
        queryClient.invalidateQueries('subscribes/resum')
      },
    }
  )

  const mapCorrectionEvent: { [key in ArticleCorrection['event']]: string } = {
    'edit-name': 'changé le nom',
    'edit-price': 'changé le prix',
    'cancel-recover': 'annulé la récupération',
    'cancel-refused': 'annulé le refus',
    'cancel-sold': 'annulé la vente',
    'cancel-valided': 'annulé la validation',
  }

  function handleEditDone(event: CustomEvent<Article>) {
    article = { ...article, ...event.detail }
  }
</script>

{#if article}
  {#if modeAdmin && $troc}
    <TagsPrint
      bind:this={tagsPrint}
      articles={[article]}
      tag={$troc.tag}
      currency={$troc.currency}
    />
  {/if}

  <Dialog bind:active class="pa-4" width="large">
    <div class="d-flex mb-4">
      <div class="text-h6">
        #{article.ref} - {article.name}
      </div>
      <div class="flex-grow-1" />

      <div class="text-subtitle-2 pt-1">
        Statut : {getStateLabel(article)}
      </div>
    </div>

    <ArticleStateHistoric {article} />

    {#if $queryCorrections && $queryCorrections.isSuccess && !$queryCorrections.isLoading && $queryCorrections.data?.corrections?.length}
      {#if !correctionsVisible}
        <div out:slide|local class="d-flex">
          <div class="flex-grow-1" />
          <Button
            on:click={() => (correctionsVisible = true)}
            size="small"
            text
          >
            <IconLink icon={faHistory} class="mr-2" size="1em" opacity />
            {$queryCorrections.data.corrections.length}
            éditions
          </Button>
        </div>
      {:else}
        <div in:slide|local>
          <b>Historique des éditions : </b>

          {#each $queryCorrections.data.corrections as correction}
            <div>
              {intl.format(new Date(correction.timestamp))} -
              {correction.author.name}
              a
              {mapCorrectionEvent[correction.event]}
            </div>
          {/each}
        </div>
      {/if}
    {/if}

    <Divider class="mt-4 mb-4" />

    {#if $queryDelete.isLoading}
      <div class="text-center">
        <Button text disabled>
          <Loader title="Suppression en cours" />
        </Button>
      </div>
    {:else}
      <div class="d-flex flex-wrap" style="gap: 0.5em;">
        {#if !article.valided && !article.refused}
          <Button
            text
            class="red-text mr-2"
            on:click={() =>
              confirm('Etes vous sur ?') &&
              $queryDelete.mutate({ articleId: article?._id || '' })}
          >
            Supprimer
          </Button>
        {/if}

        {#if modeAdmin}
          {#if $queryCancelEvent.isLoading}
            <Button disabled text><Loader /></Button>
          {:else if article.sold}
            <Button
              text
              class="red-text"
              on:click={() => $queryCancelEvent.mutate('sold')}
            >
              Annuler la vente
            </Button>
          {:else if article.recover}
            <Button
              text
              class="red-text"
              on:click={() => $queryCancelEvent.mutate('recover')}
            >
              Annuler la récupération
            </Button>
          {:else if article.valided}
            <Button
              text
              class="red-text"
              on:click={() => $queryCancelEvent.mutate('valided')}
            >
              Annuler la validation
            </Button>
          {:else if article.refused}
            <Button
              text
              class="red-text"
              on:click={() => $queryCancelEvent.mutate('refused')}
            >
              Annuler le refus
            </Button>
          {/if}

          <div class="flex-grow-1" />

          <Button
            fab
            size="small"
            title="Imprimer l'étiquette"
            depressed
            on:click={() => tagsPrint.print()}
          >
            <Icon path={mdiPrinter} />
          </Button>

          {#if modeAdmin || (!article.valided && !article.refused)}
            <ArticleEditDialog
              {article}
              on:done={handleEditDone}
              actionName="valider"
            />
          {/if}
        {/if}
      </div>
    {/if}
  </Dialog>
{/if}
