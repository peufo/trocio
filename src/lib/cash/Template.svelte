<script lang="ts">
  import { fade, scale } from 'svelte/transition'
  import { flip } from 'svelte/animate'
  import { Button, Icon } from 'svelte-materialify/src'
  import MagicSelect from '$lib/util/MagicSelect.svelte'
  import { mdiTextBoxCheckOutline } from '@mdi/js'
  import { faTimes } from '@fortawesome/free-solid-svg-icons'

  import { renderAmount } from '$lib/utils'
  import { troc } from '$lib/troc/store'
  import { api } from '$lib/api'
  import type { Article } from 'types'
  import IconLink from '$lib/util/IconLink.svelte'
  import notify from '$lib/notify'
  import Loader from '$lib/util/Loader.svelte'

  export let pendingItems: any[] = []
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

<div class="d-flex">
  <!-- Selecteur -->
  <div class="flex-grow-1 mr-4" style="min-width: 260px; max-width: 320px;">
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
      <div slot="action">
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
      </div>
    </MagicSelect>
  </div>

  <!-- Selection -->
  <div class="flex-grow-1">
    <!-- Selection actions -->
    <div class="d-flex">
      <slot name="actions-permanent-left" />

      <div class="flex-grow-1" />

      {#if pendingItems.length}
        <div in:fade|locale>
          <slot name="actions" />
        </div>
      {/if}

      <slot name="actions-permanent-right" />
    </div>

    <!-- Basket -->
    <div class="mt-2">
      {#if pendingItems.length}
        <div in:fade|local class="d-flex flex-wrap">
          {#each pendingItems as article, index (article._id)}
            <div
              in:scale|local
              animate:flip={{ duration: 200 }}
              class="d-flex simple-card pl-2 pr-2 pt-1 pb-1 ma-1"
              style="min-width: 200px; max-width: calc(50% - 8px);"
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
</div>
