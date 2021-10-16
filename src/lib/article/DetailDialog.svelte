<script lang="ts">
  import notify from '$lib/notify'
  import { getHeader, renderAmount } from '$lib/utils'

  import { Dialog, Divider, Button } from 'svelte-materialify'

  import type { ArticleLookup } from 'types'
  import { getStatut } from '$lib/utils'
  import {
    QueryClient,
    useMutation,
    useQueryClient,
  } from '@sveltestack/svelte-query'
  import { api } from '$lib/api'
  import Loader from '$lib/util/Loader.svelte'

  export let active = false
  export let article: ArticleLookup | undefined

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
    (data: { articleId: string; newName: string }) =>
      api('/api/articles/edit-name', {
        method: 'post',
        data,
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
    (data: { articleId: string; newPrice: string }) =>
      api('/api/articles/edit-price', {
        method: 'post',
        data,
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

  function handleEditName() {
    const newName = prompt('Nouveau nom', article?.name)
    if (!newName || !article) return
    $queryEditName.mutate({ articleId: article._id, newName })
  }

  function handleEditPrice() {
    const newPrice = prompt('Nouveau prix', article?.price)
    if (!newPrice || !article) return
    $queryEditPrice.mutate({ articleId: article._id, newPrice })
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

    <div>
      Proposé {intl.format(new Date(article.createdAt))}
      par {article.provider?.name}
      pour {renderAmount(article.price)}
    </div>

    <Divider />

    {#if $queryDelete.isLoading}
      <div class="text-center">
        <Button text disabled>
          <Loader title="Suppression en cours" />
        </Button>
      </div>
    {:else}
      <div class="d-flex">
        <Button
          text
          class="red-text mr-2"
          on:click={() =>
            $queryDelete.mutate({ articleId: article?._id || '' })}
        >
          Supprimer
        </Button>
        <Button text on:click={handleEditName}>Modifier le nom</Button>
        <Button text on:click={handleEditPrice}>Modifier le prix</Button>
      </div>
    {/if}
  </Dialog>
{/if}
