<script lang="ts">
  import { fly } from 'svelte/transition'
  import { useMutation, useQueryClient } from '@sveltestack/svelte-query'
  import { mdiPrinter } from '@mdi/js'

  import { Divider, Button, Icon, List, ListItem } from '$material'
  import ArticleEditDialog from '$lib/article/EditDialog.svelte'
  import TagsPrint from '$lib/troc/TagsPrint.svelte'
  import type { Article, ArticleLookup, ArticleState } from 'types'
  import { getState, getStateLabel } from '$lib/utils'
  import { troc } from '$lib/troc/store'
  import { api } from '$lib/api'
  import { isMobile } from '$lib/store/layout'
  import Loader from '$lib/util/Loader.svelte'
  import MagicMenu from '$lib/util/MagicMenu.svelte'

  import ArticleHistoricState from '$lib/article/HistoricState.svelte'
  import ArticleHistoricEdition from '$lib/article/HistoricEdition.svelte'
  import IconLink from '$lib/util/IconLink.svelte'
  import { faAngleLeft, faAngleRight } from '@fortawesome/free-solid-svg-icons'
  import { faEdit } from '@fortawesome/free-regular-svg-icons'

  export let state: 'main' | 'historic-state' | 'historic-edit' = 'main'
  export let active = false
  export let modeAdmin = false

  let article: ArticleLookup | undefined
  let magicMenu: MagicMenu

  export function open(event: MouseEvent, _article: ArticleLookup) {
    article = _article
    magicMenu.open(event)
  }

  export function close() {
    magicMenu.close()
  }

  let tagsPrint: TagsPrint
  let articleEditDialog: ArticleEditDialog

  const queryClient = useQueryClient()
  let correctionsVisible = false

  $: if (!active) correctionsVisible = false

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

  const cancelActions: { state: ArticleState; label: string }[] = [
    { state: 'sold', label: 'la vente' },
    { state: 'recover', label: 'la récupération' },
    { state: 'valided', label: 'la validation' },
    { state: 'refused', label: 'le refus' },
  ]

  $: cancelAction = cancelActions.find(
    ({ state }) => state === getState(article)
  )
</script>

<MagicMenu bind:this={magicMenu} on:open={() => (state = 'main')} on:close>
  {#if article}
    <List style="overflow-x: hidden;" dense={!$isMobile}>
      {#if state === 'main'}
        <div in:fly|local={{ x: -200 }}>
          <ListItem disabled>
            #{article.ref} - {article.name}
          </ListItem>
          <ListItem on:click={() => (state = 'historic-state')}>
            Évolution du status
            <span slot="append">
              <IconLink icon={faAngleRight} size="1.2em" class="ml-2" />
            </span>
          </ListItem>
          <ListItem on:click={() => (state = 'historic-edit')}>
            Voir les éditions
            <span slot="append">
              <IconLink icon={faAngleRight} size="1.2em" class="ml-2" />
            </span>
          </ListItem>

          {#if modeAdmin || (!article.valided && !article.refused)}
            <ListItem
              on:click={() => {
                close()
                articleEditDialog.open()
              }}
            >
              <span slot="prepend">
                <IconLink icon={faEdit} size="1.1em" class="mr-3" />
              </span>
              Éditer
            </ListItem>
          {/if}

          <ListItem
            on:click={() => {
              close()
              tagsPrint.print()
            }}
          >
            <span slot="prepend">
              <Icon path={mdiPrinter} class="mr-3" size="1.1em" />
            </span>
            Imprimer l'étiquette
          </ListItem>
        </div>
      {/if}

      {#if state === 'historic-state'}
        <div in:fly|local={{ x: 200 }}>
          <ListItem on:click={() => (state = 'main')}>
            <span slot="prepend">
              <IconLink icon={faAngleLeft} size="1.2em" class="mr-4" />
            </span>
            #{article.ref} - status
          </ListItem>

          <ArticleHistoricState {article} />
        </div>
      {/if}

      {#if state === 'historic-edit'}
        <div in:fly|local={{ x: 200 }}>
          <ListItem on:click={() => (state = 'main')}>
            <span slot="prepend">
              <IconLink icon={faAngleLeft} size="1.2em" class="mr-4" />
            </span>
            #{article.ref} - édition
          </ListItem>
          <ArticleHistoricEdition {article} />
        </div>
      {/if}
    </List>
  {/if}
</MagicMenu>

{#if $troc && article}
  <TagsPrint
    bind:this={tagsPrint}
    articles={[article]}
    tag={$troc.tag}
    currency={$troc.currency}
  />

  <ArticleEditDialog
    bind:this={articleEditDialog}
    {article}
    actionName="valider"
    buttonType="none"
  />
{/if}

<!--

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
        {:else if cancelAction}
          <Button
            text
            class="red-text"
            on:click={() =>
              cancelAction && $queryCancelEvent.mutate(cancelAction.state)}
          >
            Annuler {cancelAction.label}
          </Button>
        {/if}

        <div class="flex-grow-1" />


      {/if}
    </div>
  {/if}
-->
