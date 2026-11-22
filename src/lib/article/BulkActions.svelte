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
  } from '@mdi/js'

  import { Button, Icon } from '$material'
  import type { Article, ArticleState } from 'types'
  import { api } from '$lib/api'
  import notify from '$lib/notify'
  import { getState } from '$lib/utils'
  import { troc } from '$lib/troc/store'
  import TagsPrint from '$lib/troc/TagsPrint.svelte'

  type BulkAction = 'valid' | 'refuse' | 'recover' | 'cancel' | 'delete'

  /** Articles sélectionnés (complets ou projection légère) */
  export let selected: Partial<Article>[] = []

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

<div class="bulk-actions simple-card d-flex align-center flex-wrap pa-1 mb-2">
  <Button icon size="small" on:click={() => (selected = [])} title="Vider la sélection">
    <Icon path={mdiClose} size="1.1em" />
  </Button>
  <span class="mx-2 text-no-wrap">
    {selected.length} article{selected.length > 1 ? 's' : ''} sélectionné{selected.length >
    1
      ? 's'
      : ''}
  </span>

  {#if progress}
    <span class="text--secondary mx-2">{progress}</span>
  {/if}

  <div class="flex-grow-1" />

  {#each actions as action (action.action)}
    {@const count = eligibles(action.states).length}
    <Button
      text
      size="small"
      disabled={!count || $queryBulk.isLoading}
      on:click={() => run(action)}
    >
      <Icon path={action.icon} class="mr-1 {action.iconClass}" size="1.1em" />
      {action.label} ({count})
    </Button>
  {/each}

  <Button
    text
    size="small"
    disabled={$queryBulk.isLoading}
    on:click={() => tagsPrint.print()}
  >
    <Icon path={mdiTagOutline} class="mr-1" size="1.1em" />
    Imprimer les étiquettes
  </Button>
</div>

{#if $troc}
  <TagsPrint
    bind:this={tagsPrint}
    articles={selected}
    tag={$troc.tag}
    currency={$troc.currency}
  />
{/if}
