<script lang="ts">
  import { onMount } from 'svelte'
  import { flip } from 'svelte/animate'
  import { fade, scale, slide, fly } from 'svelte/transition'
  import { params } from '@roxi/routify'
  import {
    mdiChevronDown,
    mdiClose,
    mdiQrcodeScan,
    mdiTextBoxCheckOutline,
  } from '@mdi/js'
  import { faTimes } from '@fortawesome/free-solid-svg-icons'
  import 'animate.css'

  import { Button, Icon } from '$material'
  import MagicSelect from '$lib/util/MagicSelect.svelte'
  import { isMobile } from '$lib/store/layout'
  import { renderAmount } from '$lib/utils'
  import { troc } from '$lib/troc/store'
  import { api } from '$lib/api'
  import type { Article } from 'types'
  import IconLink from '$lib/util/IconLink.svelte'
  import notify from '$lib/notify'
  import Scanner from '$lib/scanner/Scanner.svelte'
  import { getMismatchRaison } from '$lib/scanner/utils'

  export let pendingItems: Article[] = []
  export let queryParams = {}
  export let placeholder = 'Articles'
  export let canSelectAll = false
  export let message = ''
  export let disableScanner = false
  let isScannerOpen = false
  let magicSelect: MagicSelect
  let selectAllPromise: Promise<void>

  /** Gestion de l'affichage des seléctions en mode mobile */
  let isSelectionOpen = false
  let isIndicatorAnimated = false

  onMount(() => {
    if (!$isMobile) magicSelect.focus()
    if ($params['preselect_article'])
      selectArticleId($params['preselect_article'])
  })

  export function closeSelection() {
    isSelectionOpen = false
  }

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

    if ($isMobile) animeIndicator()
  }

  function handleSelectArticle(event: { detail: Article }) {
    selectArticle(event.detail)
  }

  function handleDetectArticle(event: { detail: string }) {
    selectArticleId(event.detail)
  }

  export async function selectArticleId(articleId: string) {
    try {
      const [article] = await api<Article[]>('/api/articles', {
        params: { exact__id: articleId, ...queryParams },
      })
      if (!article) {
        const raison = await getMismatchRaison(articleId, queryParams)
        notify.warning(raison)
        return
      }

      selectArticle(article)
    } catch (error: any) {
      notify.error(error)
    }
  }

  export function selectArticle(article: Article) {
    if (pendingItems.map(({ _id }) => _id).includes(article._id))
      return notify.warning('Article déjà sélectioné')
    pendingItems = [...pendingItems, article]
    if ($isMobile) animeIndicator()
  }

  function handleRemove(index: number) {
    pendingItems = [
      ...pendingItems.slice(0, index),
      ...pendingItems.slice(index + 1),
    ]
  }

  function handleReset() {
    pendingItems = []
    setTimeout(closeSelection, 300)
  }

  function animeIndicator() {
    const duration = 1000
    if (!isIndicatorAnimated)
      setTimeout(() => (isIndicatorAnimated = false), duration)
    isIndicatorAnimated = true
  }
</script>

<div
  class="wrapper"
  class:is-mobile={$isMobile}
  class:no-pending-items={!pendingItems.length}
  class:selection-open={isSelectionOpen}
>
  <!-- Selecteur -->
  <div class="selector">
    {#if isScannerOpen}
      <Scanner
        on:close={() => (isScannerOpen = false)}
        on:detect={handleDetectArticle}
      />
    {:else}
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
        on:select={handleSelectArticle}
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
                depressed
                size="small"
                title="Tout sélectioner"
                on:click={() => (selectAllPromise = handleSelectAll())}
              >
                <Icon path={mdiTextBoxCheckOutline} />
              </Button>
            {/await}
          {/if}

          {#if !disableScanner && $isMobile}
            <Button
              fab
              depressed
              size="small"
              title="Scanner des étiquettes"
              on:click={() => (isScannerOpen = true)}
            >
              <Icon path={mdiQrcodeScan} />
            </Button>
          {/if}

          <slot name="actions-search" />
        </div>
      </MagicSelect>
    {/if}
  </div>

  <!-- Selection -->
  <div class="selection" class:simple-card={$isMobile}>
    <!-- Selection indicator -->
    {#if $isMobile && !isSelectionOpen}
      <div
        transition:slide|local
        class:animate__bounce={isIndicatorAnimated}
        class="selection-indicator"
      >
        <Button
          fab
          class="secondary-color"
          on:click={() => (isSelectionOpen = true)}
          style="font-size: large;"
        >
          {#key pendingItems.length}
            <span
              in:fly|local={{ y: -40, duration: 200, delay: 400 }}
              out:fly|local={{ y: 40, duration: 200, delay: 100 }}
              class="absolute-center"
            >
              {pendingItems.length}
            </span>
          {/key}
        </Button>
      </div>
    {/if}

    <!-- Selection header -->
    <div class="d-flex align-center" style="height: 40px; gap: 0.5em;">
      {#if pendingItems.length}
        <div in:fade|local>
          <Button depressed on:click={handleReset}>
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

      {#if $isMobile}
        <Button
          fab
          size="small"
          outlined
          class="secondary-text"
          on:click={() => (isSelectionOpen = false)}
        >
          <Icon path={mdiChevronDown} />
        </Button>
      {/if}
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
  .absolute-center {
    position: absolute;
    top: 50%;
    left: 50%;
    translate: -50% -50%;
  }

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

  $selection-size: 72px;
  $wrapper-padding: 8px;

  .wrapper.is-mobile {
    padding: $wrapper-padding;
    position: relative;
    overflow: hidden;

    .basket-content > div {
      max-width: 100%;
    }
    .selector {
      width: 100%;
    }

    .selection {
      position: absolute;
      padding: $wrapper-padding;
      inset: 0;
      background: var(--theme-surface);
      transition: ease-in-out 400ms all;
      translate: calc(100% - $selection-size) calc(100% - $selection-size);
      border-top-left-radius: calc($selection-size / 2);
    }

    &.no-pending-items .selection {
      translate: calc(100% - $selection-size) 100%;
    }

    &.selection-open .selection {
      translate: 0px 0px;
      border-top-left-radius: 8px;
      border-color: transparent;
    }

    & .selection-indicator {
      width: $selection-size;
      height: $selection-size;
      flex-shrink: 0;
      animation-duration: 1000ms;
    }
  }
</style>
