<script lang="ts">
  import { createEventDispatcher } from 'svelte'
  import { faList, faPlus, faTimes } from '@fortawesome/free-solid-svg-icons'
  import { faEdit } from '@fortawesome/free-regular-svg-icons'
  import { mdiPlus } from '@mdi/js'
  import { Dialog, Button, Checkbox, Icon, ListItem } from '$material'

  import type { Article } from 'types'
  import { isMobile } from '$lib/store/layout'
  import notify from '$lib/notify'
  import { troc } from '$lib/troc/store'
  import ArticleForm from '$lib/article/Form.svelte'
  import ArticleFormList from '$lib/article/FormList.svelte'
  import IconLink from '$lib/util/IconLink.svelte'

  export let subscribeId: string = ''
  export let article: Article | undefined = undefined
  export let active = false
  export let listMode = false
  export let disabled = false
  export let fullscreen = $isMobile
  export let buttonType: 'button' | 'icon' | 'list' = 'button'
  export let actionName = 'Proposer'

  let textarea: HTMLTextAreaElement | undefined
  let keepOpen = true

  const dispatch = createEventDispatcher<{
    open: null
    close: null
    done: Article
    doneList: Article[]
  }>()

  function closeDialog() {
    dispatch('close')
    active = false
  }

  function handleClicOpen() {
    if (disabled && !$troc.is_try)
      return notify.warning(`L'ajout d'article est désactivé.`)
    dispatch('open')
    active = true
  }

  function handleDone(event: CustomEvent<Article>) {
    if (!keepOpen || article) closeDialog()
    dispatch('done', event.detail)
  }
  function handleDoneList(event: CustomEvent<Article[]>) {
    if (!keepOpen) closeDialog()
    dispatch('doneList', event.detail)
  }
</script>

{#if buttonType === 'icon'}
  <Button
    fab
    size="small"
    title="Ajouter un article"
    depressed
    class="secondary-color"
    on:click={handleClicOpen}
  >
    <Icon path={mdiPlus} />
  </Button>
{:else if buttonType === 'list'}
  <ListItem>
    <IconLink icon={faEdit} size="1.1em" class="mr-2" />
    Éditer
  </ListItem>
{:else}
  <Button depressed on:click={handleClicOpen} class="secondary-color">
    {#if article}
      <IconLink icon={faEdit} opacity size="1.1em" class="mr-2" />
      éditer
    {:else}
      <IconLink icon={faPlus} opacity size="1.1em" class="mr-2" />
      article
    {/if}
  </Button>
{/if}

<Dialog
  bind:active
  class="pa-4"
  on:introend={() => textarea?.focus()}
  {fullscreen}
>
  <div class="d-flex justify-space-between mb-3">
    <div class="text-h6">
      {#if article}
        Éditer un article
      {:else}
        {actionName} {listMode ? `une liste d'` : 'un '}article
      {/if}
    </div>
    {#if fullscreen}
      <div class="flex-grow-1" />
      <IconLink icon={faTimes} on:click={closeDialog} clickable />
    {/if}
  </div>

  {#if listMode}
    <ArticleFormList {subscribeId} on:done={handleDoneList} {actionName} />
  {:else}
    <ArticleForm {subscribeId} on:done={handleDone} {article} {actionName} />
  {/if}

  {#if !article}
    <div class="d-flex mt-2">
      <Checkbox bind:checked={keepOpen} color="secondary">
        Garder la fenêtre ouverte
      </Checkbox>
      <div class="flex-grow-1" />

      <Button depressed size="small" on:click={() => (listMode = !listMode)}>
        <IconLink
          icon={!listMode ? faList : faPlus}
          opacity
          size="1em"
          class="mr-2"
        />
        {!listMode ? 'Charger une liste' : 'Un seul article'}
      </Button>
    </div>
  {/if}
</Dialog>
