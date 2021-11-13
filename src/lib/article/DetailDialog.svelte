<script lang="ts">
  import { renderAmount } from '$lib/utils'
  import { Dialog, Divider, Button, Icon } from 'svelte-materialify'
  import { useMutation, useQueryClient } from '@sveltestack/svelte-query'
  import printJS from 'print-js'
  import { mdiPrinter } from '@mdi/js'

  import TagsPrint from '$lib/troc/TagsPrint.svelte'
  import type { ArticleLookup, EventName } from 'types'
  import { getStatut } from '$lib/utils'
  import { troc } from '$lib/troc/store'
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
        // TODO: lookup subscribe
        article = articleUpdated
        queryClient.invalidateQueries('articles')
        queryClient.invalidateQueries('subscribes/resum')
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

  function print() {
    printJS({
      printable: 'dialogTag',
      type: 'html',
      targetStyles: ['*'],
    })
  }
</script>

{#if article}
  {#if modeAdmin && $troc}
    <TagsPrint id="dialogTag" articles={[article]} tag={$troc?.tag} />
  {/if}

  <Dialog bind:active class="pa-4" style="cursor: initial;" width="large">
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
        par <b>{article.validator?.name}</b>
      </p>
    {:else if article.refused}
      <p>
        Refusé le {intl.format(new Date(article.refused))}
        par <b>{article.validator?.name}</b>
      </p>
    {/if}

    {#if article.sold}
      <p>
        Vendu le {intl.format(new Date(article.sold))}
        par <b>{article.seller?.name}</b>
        à <b>{article.buyer?.name || article.buyerSub?.name}</b>
      </p>
    {:else if article.recover}
      <p>
        Récupèré le {intl.format(new Date(article.recover))}
        par <b>{article.seller?.name}</b>
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
        <Button text class="blue-text" on:click={handleEditName}>
          Modifier le nom
        </Button>
        <Button text class="blue-text" on:click={handleEditPrice}>
          Modifier le prix
        </Button>

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

          <Button
            fab
            size="small"
            title="Imprimer l'étiquette"
            depressed
            on:click={print}
          >
            <Icon path={mdiPrinter} />
          </Button>

          <!--
            TODO: Toute les actions accessible directement ici ?

            {#if !article.valided}
              <Button text on:click={() => notify.info('TODO')}>Valider</Button>
              <Button text on:click={() => notify.info('TODO')}>Refuser</Button>
            {:else if article.valided && !article.sold && !article.refused}
              <Button text on:click={() => notify.info('TODO')}>Vendre</Button>
              <Button text on:click={() => notify.info('TODO')}>Rendre</Button>
            {/if}
          -->
        {/if}
      </div>
    {/if}
  </Dialog>
{/if}
