<script lang="ts">
  import { createEventDispatcher } from 'svelte'
  import {
    faPlus,
    faTimes,
    faChevronDown,
  } from '@fortawesome/free-solid-svg-icons'
  import { faEdit } from '@fortawesome/free-regular-svg-icons'
  import { mdiPlus } from '@mdi/js'
  import {
    Dialog,
    Button,
    Checkbox,
    Icon,
    Menu,
    List,
    ListItem,
  } from '$material'

  import type { Article } from 'types'
  import { isMobile } from '$lib/store/layout'
  import notify from '$lib/notify'
  import { troc } from '$lib/troc/store'
  import ArticleForm from '$lib/article/Form.svelte'
  import ArticleFormList from '$lib/article/FormList.svelte'
  import ArticleFormImport from '$lib/article/FormImport.svelte'
  import IconLink from '$lib/util/IconLink.svelte'

  export let subscribeId: string = ''
  export let article: Article | undefined = undefined
  export let active = false
  export let disabled = false
  export let fullscreen = $isMobile
  export let buttonType: 'button' | 'icon' | 'none' = 'button'
  export let actionName = 'Proposer'

  type Mode = 'simple' | 'list' | 'import'
  let mode: Mode = 'simple'
  const modeLabel: Record<Mode, string> = {
    simple: 'Simple',
    list: 'Liste',
    import: 'Importation',
  }
  const modeLabelEntries = Object.entries(modeLabel) as [Mode, string][]

  let keepOpen = false

  const dispatch = createEventDispatcher<{
    open: null
    close: null
    done: Article
    doneList: Article[]
  }>()

  export function open() {
    dispatch('open')
    active = true
  }

  export function close() {
    dispatch('close')
    active = false
  }

  function handleClicOpen() {
    if (disabled && !$troc.is_try)
      return notify.warning(`L'ajout d'article est désactivé.`)
    open()
  }

  function handleDone(event: CustomEvent<Article>) {
    if (!keepOpen || article) close()
    dispatch('done', event.detail)
  }
  function handleDoneList(event: CustomEvent<Article[]>) {
    if (!keepOpen) close()
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
{:else if buttonType === 'button'}
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

<Dialog bind:active class="pa-4" {fullscreen}>
  <div class="d-flex justify-space-between mb-3">
    <div class="text-h6">
      {#if article}
        Éditer un article
      {:else if mode === 'simple'}
        {actionName} un article
      {:else if mode === 'list'}
        {actionName} une liste d'articles
      {:else if mode === 'import'}
        Importer des articles invendus
      {/if}
    </div>
    <div class="flex-grow-1" />
    {#if !article}
      <Menu right>
        <div slot="activator">
          <Button text size="small" style="opacity: .8;" class="d-flex">
            {modeLabel[mode]}
            <IconLink icon={faChevronDown} size="1em" class="ml-2" />
          </Button>
        </div>
        <List dense>
          {#each modeLabelEntries as [_mode, label]}
            <ListItem
              on:click={() => (mode = _mode)}
              on:keypress={(e) => e.key === 'Enter' && (mode = _mode)}
            >
              {label}
            </ListItem>
          {/each}
        </List>
      </Menu>
    {/if}

    {#if fullscreen}
      <IconLink icon={faTimes} on:click={close} clickable />
    {/if}
  </div>

  {#if mode === 'simple'}
    <ArticleForm {subscribeId} on:done={handleDone} {article} {actionName} />
  {:else if mode === 'list'}
    <ArticleFormList {subscribeId} on:done={handleDoneList} {actionName} />
  {:else if mode === 'import'}
    <ArticleFormImport {subscribeId} on:done={handleDoneList} />
  {/if}

  {#if !article && mode === 'simple'}
    <Checkbox bind:checked={keepOpen} color="secondary">
      Garder la fenêtre ouverte
    </Checkbox>
  {/if}
</Dialog>
