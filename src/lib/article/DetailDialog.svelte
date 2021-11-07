<script lang="ts">
  import { renderAmount } from '$lib/utils'

  import { Dialog, Divider, Button } from 'svelte-materialify'

  import type { ArticleLookup, EventName } from 'types'

  import { getStatut } from '$lib/utils'
  import { useMutation, useQueryClient } from '@sveltestack/svelte-query'
  import { api } from '$lib/api'
  import Loader from '$lib/util/Loader.svelte'

  export let active = false
  export let article: ArticleLookup | undefined
  export let modeAdmin = false

  const queryClient = useQueryClient()

  const intl = new Intl.DateTimeFormat(undefined, {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
  })

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

  const queryEditName = useMutation(
    (newName: string) =>
      api('/api/articles/edit-name', {
        method: 'post',
        data: { articleId: article?._id, newName },
        success: 'Nom modifé',
      }),
    {
      onSuccess: (newArticle) => {
        // @ts-ignore
        article.name = newArticle.name
        queryClient.invalidateQueries('articles')
      },
    }
  )

  const queryEditPrice = useMutation(
    (newPrice: string) =>
      api('/api/articles/edit-price', {
        method: 'post',
        data: { articleId: article?._id, newPrice },
        success: 'Prix mis à jour',
      }),
    {
      onSuccess: (newArticle) => {
        // @ts-ignore
        article.price = newArticle.price
        queryClient.invalidateQueries('articles')
      },
    }
  )

  const queryCancelEvent = useMutation(
    (eventName: EventName) =>
      api<{ articleId: string; eventName: EventName }, ArticleLookup>(
        '/api/articles/cancel-event',
        {
          method: 'post',
          data: { eventName, articleId: article?._id },
          success: 'Evenement de caisse annulé',
        }
      ),
    {
      onSuccess: (articleUpdated) => {
        article = articleUpdated
        queryClient.invalidateQueries('articles')
      },
    }
  )

  function handleEditName() {
    const newName = prompt('Nouveau nom', article?.name)
    if (!newName || !article) return
    $queryEditName.mutate(newName)
  }

  function handleEditPrice() {
    const newPrice = prompt('Nouveau prix', String(article?.price))
    if (!newPrice || !article) return
    $queryEditPrice.mutate(newPrice)
  }
</script>

{#if article}
  <Dialog bind:active class="pa-4" style="cursor: initial;">
    <div class="d-flex mb-4">
      <div class="text-h6">
        #{article.ref} - {article.name}
      </div>
      <div class="flex-grow-1" />

      <div class="text-subtitle-2 pt-1">
        Statut : {getStatut(article)}
      </div>
    </div>

    <p>
      Proposé le {intl.format(new Date(article.createdAt))}
      par <b>{article.provider?.name || article.providerSub?.name}</b>
      pour <b>{renderAmount(article.price)}</b>
    </p>
    {#if article.valided}
      <p>
        Validé le {intl.format(new Date(article.valided))}
        par {article.validator?.name}
      </p>
    {:else if article.refused}
      <p>
        Refusé le {intl.format(new Date(article.refused))}
        par {article.validator?.name}
      </p>
    {/if}

    <Divider />

    {#if $queryDelete.isLoading}
      <div class="text-center">
        <Button text disabled>
          <Loader title="Suppression en cours" />
        </Button>
      </div>
    {:else}
      <div class="d-flex flex-wrap">
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
        <Button text on:click={handleEditName}>Modifier le nom</Button>
        <Button text on:click={handleEditPrice}>Modifier le prix</Button>

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
        {/if}
      </div>
    {/if}
  </Dialog>
{/if}
