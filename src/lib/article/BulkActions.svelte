<script lang="ts">
  import { useMutation, useQueryClient } from '@sveltestack/svelte-query'
  import {
    mdiCheck,
    mdiClose,
    mdiTagOutline,
    mdiTrashCanOutline,
    mdiUndo,
    mdiArrowULeftTop,
    mdiCancel,
    mdiSelectAll,
  } from '@mdi/js'

  import { Button, Icon, Menu, List, ListItem } from '$material'
  import type { Article, ArticleState, ParamsArticleAPI } from 'types'
  import { api } from '$lib/api'
  import notify from '$lib/notify'
  import { getState } from '$lib/utils'
  import { troc } from '$lib/troc/store'
  import TagsPrint from '$lib/troc/TagsPrint.svelte'

  type BulkAction = 'valid' | 'refuse' | 'recover' | 'cancel' | 'delete'

  /** Articles sélectionnés (complets ou projection légère) */
  export let selected: Partial<Article>[] = []
  /** Paramètres de la recherche affichée, pour sélectionner tout le filtre */
  export let filterParams: ParamsArticleAPI
  /** Propose de sélectionner tous les articles du filtre */
  export let canSelectAllFiltered = false

  let loadingFilterSelection = false
  $: busy = $queryBulk.isLoading || loadingFilterSelection

  async function selectAllFiltered() {
    loadingFilterSelection = true
    try {
      selected = await api<ParamsArticleAPI, Partial<Article>[]>(
        '/api/articles/selection',
        { params: filterParams }
      )
    } finally {
      loadingFilterSelection = false
    }
  }

  /** Taille max d'un lot accepté par l'API */
  const BATCH_SIZE = 1000

  const actions: {
    action: BulkAction
    label: string
    verb: string
    icon: string
    iconClass: string
    states: ArticleState[]
  }[] = [
    {
      action: 'valid',
      label: 'Valider',
      verb: 'Valider',
      icon: mdiCheck,
      iconClass: 'blue-text',
      states: ['proposed'],
    },
    {
      action: 'refuse',
      label: 'Refuser',
      verb: 'Refuser',
      icon: mdiCancel,
      iconClass: 'red-text',
      states: ['proposed'],
    },
    {
      action: 'recover',
      label: 'Récupérer',
      verb: 'Marquer comme récupérés',
      icon: mdiArrowULeftTop,
      iconClass: 'orange-text',
      states: ['valided'],
    },
    {
      action: 'cancel',
      label: "Remettre à l'état précédent",
      verb: "Remettre à l'état précédent",
      icon: mdiUndo,
      iconClass: 'orange-text',
      states: ['valided', 'refused', 'sold', 'recover'],
    },
    {
      action: 'delete',
      label: 'Supprimer',
      verb: 'Supprimer définitivement',
      icon: mdiTrashCanOutline,
      iconClass: 'red-text',
      states: ['proposed'],
    },
  ]

  function eligibles(states: ArticleState[]) {
    return selected.filter((art) => states.includes(getState(art as Article)))
  }

  let progress = ''
  let tagsPrint: TagsPrint

  const queryClient = useQueryClient()

  const queryBulk = useMutation(
    async ({ action, articlesId }: { action: BulkAction; articlesId: string[] }) => {
      let updated = 0
      let skipped = 0
      const batchCount = Math.ceil(articlesId.length / BATCH_SIZE)
      try {
        for (let i = 0; i < batchCount; i++) {
          progress = batchCount > 1 ? `Lot ${i + 1}/${batchCount}` : ''
          const result = await api<
            { action: BulkAction; articlesId: string[] },
            { updated: number; skipped: number }
          >('/api/articles/bulk', {
            method: 'post',
            data: {
              action,
              articlesId: articlesId.slice(
                i * BATCH_SIZE,
                (i + 1) * BATCH_SIZE
              ),
            },
          })
          updated += result.updated
          skipped += result.skipped
        }
      } catch (error) {
        if (updated) notify.info(`${updated} articles modifiés avant l'erreur`)
        throw error
      } finally {
        progress = ''
      }
      return { updated, skipped }
    },
    {
      onSuccess: ({ updated, skipped }) => {
        notify.success(
          `${updated} article${updated > 1 ? 's' : ''} modifié${
            updated > 1 ? 's' : ''
          }` + (skipped ? `, ${skipped} ignoré${skipped > 1 ? 's' : ''}` : '')
        )
        selected = []
      },
      onSettled: () => {
        queryClient.invalidateQueries('articles')
        queryClient.invalidateQueries('subscribes/resum')
      },
    }
  )

  function run(action: (typeof actions)[number]) {
    const articles = eligibles(action.states)
    if (!articles.length) return
    const ignored = selected.length - articles.length
    const message =
      `${action.verb} ${articles.length} article${articles.length > 1 ? 's' : ''} ?` +
      (ignored
        ? `\n${ignored} article${ignored > 1 ? 's' : ''} dont le statut ne le permet pas ${ignored > 1 ? 'seront ignorés' : 'sera ignoré'}.`
        : '')
    if (!confirm(message)) return
    $queryBulk.mutate({
      action: action.action,
      articlesId: articles.map((art) => art._id as string),
    })
  }
</script>

<Menu
  right
  disabled={!selected.length || busy}
  closeOnClick={true}
  style="max-height: none;"
>
  <div slot="activator">
    <Button depressed disabled={!selected.length || busy} class="mr-2">
      {#if progress}
        {progress}
      {:else if loadingFilterSelection}
        Chargement…
      {:else}
        Sélection ({selected.length})
      {/if}
    </Button>
  </div>

  <List dense>
    <ListItem disabled>
      {selected.length} article{selected.length > 1 ? 's' : ''} sélectionné{selected.length >
      1
        ? 's'
        : ''}
    </ListItem>

    {#if canSelectAllFiltered}
      <ListItem on:click={selectAllFiltered}>
        <span slot="prepend">
          <Icon path={mdiSelectAll} class="mr-3" size="1.1em" />
        </span>
        Sélectionner tous les articles du filtre
      </ListItem>
    {/if}

    {#each actions as action (action.action)}
      {@const count = eligibles(action.states).length}
      <ListItem disabled={!count} on:click={() => run(action)}>
        <span slot="prepend">
          <Icon
            path={action.icon}
            class="mr-3 {action.iconClass}"
            size="1.1em"
          />
        </span>
        {action.label} ({count})
      </ListItem>
    {/each}

    <ListItem on:click={() => tagsPrint.print(selected)}>
      <span slot="prepend">
        <Icon path={mdiTagOutline} class="mr-3" size="1.1em" />
      </span>
      Imprimer les étiquettes ({selected.length})
    </ListItem>

    <ListItem on:click={() => (selected = [])}>
      <span slot="prepend">
        <Icon path={mdiClose} class="mr-3" size="1.1em" />
      </span>
      Vider la sélection
    </ListItem>
  </List>
</Menu>

{#if $troc}
  <TagsPrint
    bind:this={tagsPrint}
    tag={$troc.tag}
    currency={$troc.currency}
  />
{/if}
