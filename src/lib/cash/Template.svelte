<script lang="ts">
  import { onMount } from 'svelte'
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

  onMount(() => {
    if (!$isMobile) magicSelect.focus()
  })

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
  <div class="selector">
    <MagicSelect
      bind:this={magicSelect}
      flatMode
      keepFocus
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
      solo
      dense
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
  <div class="selection">
    <!-- Selection header -->
    <div class="d-flex align-center" style="height: 40px;">
      {#if pendingItems.length}
        <div in:fade|local>
          <Button depressed on:click={() => (pendingItems = [])}>
            {pendingItems.length === 1
              ? 'Un article'
              : `${pendingItems.length} articles`}
            {#if pendingItems.length}
              <Icon class="ml-3" style="opacity: 0.6;" path={mdiClose} />
            {/if}
          </Button>
        </div>
      {/if}

      <div class="flex-grow-1" />
      <slot name="options-selection" />
    </div>

    <!-- Basket content -->
    <div class="basket-container simple-card">
      {#if pendingItems.length}
        <div in:fade|local class="basket-content">
          {#each pendingItems as article, index (article._id)}
            <div
              in:scale|local
              animate:flip={{ duration: 200 }}
              class="simple-card"
            >
              <div class="flex-grow-1">
                <span class="text-subtitle-1">
                  {article.ref} - {article.name}
                </span>
                <br />
                <div class="text-right">
                  <b class="text-subtitle-2" style="line-height: 1;">
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
        <div class="flex-grow-1 text-center pa-16 text-caption">
          {message}
        </div>
      {/if}
    </div>

    <!-- Basket footer (actions)-->
    {#if pendingItems.length}
      <div class="d-flex">
        <div class="flex-grow-1" />
        <div in:fade|locale>
          <slot name="actions-selection" />
        </div>
      </div>
    {/if}
  </div>
</div>

<style lang="scss">
  .wrapper {
    display: flex;
    gap: 1em;
    height: 100%;
    padding: 1em;
  }

  .selection {
    display: flex;
    flex-direction: column;
    flex-grow: 1;
    gap: 8px;
  }

  .basket-container {
    flex-grow: 1;
    overflow-y: auto;
    padding: 4px;
    border-radius: 8px;
    background: var(--theme-app-bar);
  }

  .basket-content {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
    align-content: stretch;

    > div {
      display: flex;
      flex-grow: 1;
      padding: 4px 8px;
      min-width: 200px;
      max-width: calc(50% - 2px);
      background: var(--theme-cards);
      line-height: 1.3em;
    }
  }

  .selector {
    flex-shrink: 0;
    width: 360px;
  }

  .wrapper.is-mobile {
    padding: 8px;

    .basket-content > div {
      max-width: 100%;
    }
    .selector {
      width: 100%;
    }
  }
</style>
