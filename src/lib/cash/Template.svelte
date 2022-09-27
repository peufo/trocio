<script lang="ts">
  import { fade, scale } from 'svelte/transition'
  import { flip } from 'svelte/animate'
  import { Button, Icon } from 'svelte-materialify/src'
  import MagicSelect from '$lib/util/MagicSelect.svelte'
  import { mdiClose, mdiTextBoxCheckOutline } from '@mdi/js'
  import { faTimes } from '@fortawesome/free-solid-svg-icons'

  import { isMobile } from '$lib/store/layout'
  import { renderAmount } from '$lib/utils'
  import { troc } from '$lib/troc/store'
  import { api } from '$lib/api'
  import type { Article } from 'types'
  import IconLink from '$lib/util/IconLink.svelte'
  import notify from '$lib/notify'

  export let pendingItems: Article[] = []
  export let queryParams = {}
  export let placeholder = 'Articles'
  export let canSelectAll = false
  export let message = ''
  let magicSelect: MagicSelect
  let selectAllPromise: Promise<void>

  async function handleSelectAll() {
    const articles = await api<Article[]>('/api/articles', {
      params: {
        limit: 1000,
        ...queryParams,
      },
    })
    pendingItems = articles
    if (!articles.length) notify.warning(`Le client n'a pas d'article proposé`)
    if (articles.length === 1000)
      notify.warning('Seul 1000 article peuvent être sélectionés')
  }

  function handleSelect(event: { detail: Article }) {
    const article = event.detail
    setTimeout(magicSelect.focus, 250)
    if (pendingItems.map(({ _id }) => _id).includes(article._id))
      return notify.warning('Article déjà sélectioné')

    pendingItems = [...pendingItems, article]
  }

  function handleRemove(index: number) {
    pendingItems = [
      ...pendingItems.slice(0, index),
      ...pendingItems.slice(index + 1),
    ]
  }
</script>

<div class="wrapper {$isMobile ? 'is-mobile' : ''}">
  <!-- Selecteur -->
  <div class="flex-grow-1" style="min-width: 260px; max-width: 320px;">
    <MagicSelect
      bind:this={magicSelect}
      flatMode
      path="articles"
      searchKey="q"
      {placeholder}
      queryParams={{
        limit: 10,
        ...queryParams,
      }}
      getValue={(art) => `${art.ref} - ${art.name}`}
      getValue2={(art) => renderAmount(art.price, $troc.currency)}
      exepted={pendingItems.map((art) => art._id)}
      on:select={handleSelect}
    >
      <div slot="action" class="d-flex" style="gap: 4px;">
        {#if canSelectAll}
          {#await selectAllPromise}
            <Button fab size="small" disabled>
              <Icon path={mdiTextBoxCheckOutline} />
            </Button>
          {:then}
            <Button
              fab
              size="small"
              title="Tout sélectioner"
              depressed
              on:click={() => (selectAllPromise = handleSelectAll())}
            >
              <Icon path={mdiTextBoxCheckOutline} />
            </Button>
          {/await}
        {/if}
        <slot name="actions-search" />
      </div>
    </MagicSelect>
  </div>

  <!-- Selection -->
  <div class="flex-grow-1">
    <!-- Selection header -->
    <div class="d-flex align-center">
      {#if pendingItems.length}
        <div in:fade|local>
          <Button depressed on:click={() => (pendingItems = [])}>
            {pendingItems.length === 1
              ? 'Un élément'
              : `${pendingItems.length} éléments`}
            {#if pendingItems.length}
              <Icon class="ml-3" style="opacity: 0.6;" path={mdiClose} />
            {/if}
          </Button>
        </div>
      {/if}

      <div class="flex-grow-1" />
      <slot name="options-selection" />

      {#if pendingItems.length}
        <div in:fade|locale>
          <slot name="actions-selection" />
        </div>
      {/if}
    </div>

    <!-- Basket content -->
    {#if pendingItems.length}
      <div in:fade|local class="basket-content" style="gap: 0.5em;">
        {#each pendingItems as article, index (article._id)}
          <div
            in:scale|local
            animate:flip={{ duration: 200 }}
            class="simple-card"
          >
            <div class="flex-grow-1">
              <span class="text-subtitle-2">
                {article.ref} - {article.name}
              </span>
              <br />
              <div class="text-right">
                <b class="text-caption" style="line-height: 1;">
                  {renderAmount(article.price, $troc.currency)}
                </b>
              </div>
            </div>
            <div class="ml-3 mt-1">
              <IconLink
                icon={faTimes}
                clickable
                opacity
                on:click={() => handleRemove(index)}
              />
            </div>
          </div>
        {/each}
      </div>
    {:else}
      <div class="text-center pa-16 text-caption">
        {message}
      </div>
    {/if}
  </div>
</div>

<style>
  .wrapper {
    display: flex;
    gap: 1em;
  }

  .basket-content {
    display: flex;
    flex-wrap: wrap;
    align-content: stretch;
    margin-top: 4px;
  }

  .basket-content > div {
    display: flex;
    flex-grow: 1;
    padding: 4px 8px;
    min-width: 200px;
    max-width: calc(50% - 4px);
  }

  .is-mobile .basket-content > div {
    max-width: 100%;
  }
</style>
