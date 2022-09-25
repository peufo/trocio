<script lang="ts">
  import { createEventDispatcher } from 'svelte'
  import { Dialog, Button, Checkbox } from 'svelte-materialify'
  import { faList, faPlus, faTimes } from '@fortawesome/free-solid-svg-icons'

  import ArticleForm from '$lib/article/Form.svelte'
  import ArticleFormList from '$lib/article/FormList.svelte'
  import IconLink from '$lib/util/IconLink.svelte'
  import type { Article } from 'types'

  import notify from '$lib/notify'
  import { troc } from '$lib/troc/store'

  export let subscribeId: string
  export let active = false
  export let listMode = false
  export let disabled = false
  export let fullscreen = false

  let textarea: HTMLTextAreaElement | undefined
  let keepOpen = true

  const dispatch = createEventDispatcher<{
    open: null
    close: null
    createArticle: Article
    createArticles: Article[]
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

  function handleDone() {
    if (!keepOpen) closeDialog()
  }
</script>

<Button dense depressed on:click={handleClicOpen} class="primary-color">
  <IconLink icon={faPlus} opacity size="1.1em" class="mr-2" />
  article
</Button>

<Dialog
  bind:active
  class="pa-4"
  on:introend={() => textarea?.focus()}
  {fullscreen}
>
  <div class="d-flex justify-space-between mb-3">
    <div class="text-h6">
      Proposer {listMode ? `une liste d'` : 'un '}article
    </div>
    {#if fullscreen}
      <div class="flex-grow-1" />
      <IconLink icon={faTimes} on:click={closeDialog} clickable />
    {/if}
  </div>

  {#if listMode}
    <ArticleFormList {subscribeId} on:done={handleDone} />
  {:else}
    <ArticleForm {subscribeId} on:done={handleDone} />
  {/if}

  <div class="d-flex mt-2">
    <Checkbox bind:checked={keepOpen}>Garder la fenêtre ouverte</Checkbox>

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
</Dialog>
