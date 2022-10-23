<script lang="ts">
  import { FadeParams, fly } from 'svelte/transition'
  import { useMutation, useQueryClient } from '@sveltestack/svelte-query'
  import { url, params } from '@roxi/routify'
  import { mdiPrinter, mdiTrashCanOutline, mdiUndo } from '@mdi/js'
  import {
    faAngleLeft,
    faAngleRight,
    faArrowRightArrowLeft,
    faArrowRightFromBracket,
    faArrowRightToBracket,
  } from '@fortawesome/free-solid-svg-icons'
  import { faEdit } from '@fortawesome/free-regular-svg-icons'

  import { Icon, List, ListItem } from '$material'
  import ArticleEditDialog from '$lib/article/EditDialog.svelte'
  import TagsPrint from '$lib/troc/TagsPrint.svelte'
  import type { ArticleLookup, ArticleState } from 'types'
  import { getState } from '$lib/utils'
  import { troc } from '$lib/troc/store'
  import { api } from '$lib/api'
  import { isMobile } from '$lib/store/layout'
  import MagicMenu from '$lib/util/MagicMenu.svelte'
  import ArticleHistoricState from '$lib/article/HistoricState.svelte'
  import ArticleHistoricEdition from '$lib/article/HistoricEdition.svelte'
  import IconLink from '$lib/util/IconLink.svelte'

  export let state: 'main' | 'historic-state' | 'historic-edit' = 'main'
  export let active = false
  export let modeAdmin = false
  export let disabledAutoClose = false
  export let fadeParamsIn: FadeParams | undefined = undefined
  export let fadeParamsOut: FadeParams | undefined = undefined

  let article: ArticleLookup | undefined
  let magicMenu: MagicMenu

  export function open(
    _article: ArticleLookup,
    position?: { x: number; y: number }
  ) {
    article = _article
    active = true
    magicMenu.open(position)
  }

  export function close() {
    active = false
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

  $: casheRegisterParams = {
    trocId: $params.trocId,
    client_subscribe_id: article?.providerSubId,
    select_article: article?._id,
  }
</script>

<MagicMenu
  bind:this={magicMenu}
  on:open={() => (state = 'main')}
  on:close
  bind:fadeParamsIn
  bind:fadeParamsOut
>
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
              <IconLink icon={faAngleRight} size="1.1em" class="ml-2" />
            </span>
          </ListItem>
          <ListItem on:click={() => (state = 'historic-edit')}>
            Voir les éditions
            <span slot="append">
              <IconLink icon={faAngleRight} size="1.1em" class="ml-2" />
            </span>
          </ListItem>

          <!-- Liens vers la caisse -->
          {#if modeAdmin}
            {#if getState(article) === 'proposed'}
              <ListItem
                href={$url('/admin/cash_register', {
                  ...casheRegisterParams,
                  cash_register_tab_index: 0,
                })}
              >
                <span slot="prepend">
                  <IconLink
                    icon={faArrowRightToBracket}
                    size="1em"
                    class="mr-3"
                  />
                </span>

                Vers le dépot
              </ListItem>
            {:else if getState(article) === 'valided'}
              <ListItem
                href={$url('/admin/cash_register', {
                  ...casheRegisterParams,
                  cash_register_tab_index: 1,
                })}
              >
                <span slot="prepend">
                  <IconLink
                    icon={faArrowRightFromBracket}
                    size="1em"
                    class="mr-3"
                  />
                </span>
                Vers le retrait
              </ListItem>
            {:else}
              <ListItem
                href={$url('/admin/cash_register', casheRegisterParams)}
              >
                <span slot="prepend">
                  <IconLink
                    icon={faArrowRightArrowLeft}
                    size="1em"
                    class="mr-3"
                  />
                </span>

                Vers le fournisseur
              </ListItem>
            {/if}

            {#if getState(article) === 'sold'}
              <ListItem
                href={$url('/admin/cash_register', {
                  ...casheRegisterParams,
                  client_subscribe_id: article.buyerSubId,
                })}
              >
                <span slot="prepend">
                  <IconLink
                    icon={faArrowRightArrowLeft}
                    size="1em"
                    class="mr-3"
                  />
                </span>

                Vers l'acheteur
              </ListItem>
            {/if}
          {/if}

          <!-- Impression étitquette -->
          <ListItem
            on:click={() => {
              if (!disabledAutoClose) close()
              tagsPrint.print()
            }}
          >
            <span slot="prepend">
              <Icon path={mdiPrinter} class="mr-3" size="1.1em" />
            </span>
            Imprimer l'étiquette
          </ListItem>

          <!-- Edition du nom et du prix -->
          {#if modeAdmin || (!article.valided && !article.refused)}
            <ListItem
              on:click={() => {
                if (!disabledAutoClose) close()
                articleEditDialog.open()
              }}
            >
              <span slot="prepend">
                <IconLink
                  icon={faEdit}
                  size="1em"
                  class="mr-3 secondary-text"
                />
              </span>
              Éditer
            </ListItem>
          {/if}

          <!-- Annulation de status -->
          {#if modeAdmin && cancelAction}
            <ListItem
              on:click={() => {
                if (!cancelAction) return
                $queryCancelEvent.mutate(cancelAction.state)
                if (!disabledAutoClose) close()
              }}
            >
              <span slot="prepend">
                <Icon path={mdiUndo} class="mr-3 orange-text" size="1.1em" />
              </span>

              Annuler {cancelAction.label}
            </ListItem>
          {/if}

          <!-- Suppression -->
          {#if !article.valided && !article.refused}
            <ListItem
              on:click={() => {
                if (!confirm('Etes vous sur ?')) return
                $queryDelete.mutate({ articleId: article?._id || '' })
                if (!disabledAutoClose) close()
              }}
            >
              <span slot="prepend">
                <Icon
                  path={mdiTrashCanOutline}
                  class="mr-3 red-text"
                  size="1.1em"
                />
              </span>
              Supprimer
            </ListItem>
          {/if}
        </div>
      {/if}

      {#if state === 'historic-state'}
        <div in:fly|local={{ x: 200 }}>
          <ListItem on:click={() => (state = 'main')}>
            <span slot="prepend">
              <IconLink icon={faAngleLeft} size="1.2em" class="mr-4" />
            </span>
            #{article.ref} - Évolution du status
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
            #{article.ref} - Historique des éditions
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
