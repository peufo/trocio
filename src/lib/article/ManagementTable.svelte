<script lang="ts">
  import { params } from '@roxi/routify'

  import MagicTableWrapper from '$lib/util/MagicTableWrapper.svelte'
  import MagicTableFieldSelect from '$lib/util/MagicTableFieldSelect.svelte'
  import MagicTableHeaders from '$lib/util/MagicTableHeaders.svelte'
  import MagicTableBody from '$lib/util/MagicTableBody.svelte'
  import { useInfinitApi } from '$lib/api'
  import type { ParamsArticleAPI, ArticleLookup } from 'types'
  import { layout, isMobile } from '$lib/store/layout'
  import SearchTextField from '$lib/util/SearchTextField.svelte'
  import { troc } from '$lib/troc/store'
  import { getFieldsLookup } from '$lib/article/fields'
  import ArticleMenu from '$lib/article/Menu.svelte'
  import ArticleBulkActions from '$lib/article/BulkActions.svelte'
  import { Checkbox } from '$material'
  import Loader from '$lib/util/Loader.svelte'
  import { api } from '$lib/api'

  let searchValue = ''
  let fields = getFieldsLookup($params.trocId)
  let articleMenu: ArticleMenu

  let queryParams = {}

  $: filterParams = {
    exact_trocId: $params.trocId,
    or_search_name: searchValue,
    or_search_ref: searchValue,
    ...queryParams,
  }

  $: query = useInfinitApi<ParamsArticleAPI, ArticleLookup[]>([
    'articles',
    filterParams,
  ])

  /** Sélection multiple */
  let selected: Partial<ArticleLookup>[] = []
  let loadingFilterSelection = false

  // Vide la sélection quand la recherche ou les filtres changent réellement
  $: filterKey = JSON.stringify(filterParams)
  $: filterKey, clearSelection()
  function clearSelection() {
    selected = []
  }

  $: loadedItems = ($query?.data?.pages.flat() || []) as ArticleLookup[]
  $: selectedIds = new Set(selected.map((art) => art._id))
  $: allLoadedSelected =
    !!loadedItems.length && loadedItems.every((art) => selectedIds.has(art._id))
  $: someSelected = selected.length > 0 && !allLoadedSelected

  function toggleAllLoaded() {
    selected = allLoadedSelected ? [] : [...loadedItems]
  }

  async function selectAllFiltered() {
    loadingFilterSelection = true
    try {
      selected = await api<ParamsArticleAPI, Partial<ArticleLookup>[]>(
        '/api/articles/selection',
        { params: filterParams }
      )
    } finally {
      loadingFilterSelection = false
    }
  }
</script>

<ArticleMenu bind:this={articleMenu} modeAdmin />

<div class="container">
  <div class="d-flex align-center mb-2">
    <h6>{$isMobile ? 'Articles' : 'Gestion des articles'}</h6>
    <div class="flex-grow-1" />
    <MagicTableFieldSelect bind:fields />
  </div>

  {#if selected.length}
    <ArticleBulkActions bind:selected />
  {/if}

  {#if allLoadedSelected && $query.hasNextPage && selected.length === loadedItems.length}
    <div class="d-flex align-center justify-center mb-2">
      {#if loadingFilterSelection}
        <Loader />
      {:else}
        <span class="text--secondary mr-1">
          Les {loadedItems.length} articles affichés sont sélectionnés.
        </span>
        <a href="#select-all" on:click|preventDefault={selectAllFiltered}>
          Sélectionner tous les articles du filtre
        </a>
      {/if}
    </div>
  {/if}

  <MagicTableWrapper
    {query}
    class="simple-card"
    style="
      min-height: 400px;
      max-height: {$layout.mainHeight - ($troc?.is_try ? 124 : 76)}px;
    "
  >
    <thead>
      <tr>
        <th class="select-cell">
          <Checkbox
            checked={allLoadedSelected}
            indeterminate={someSelected}
            on:change={toggleAllLoaded}
          />
        </th>
        <th colspan="2" style="padding-left: 0px;">
          <SearchTextField bind:search={searchValue} flat solo dense />
        </th>

        <MagicTableHeaders {fields} bind:queryParams searchColSpan={2} />
      </tr>
    </thead>

    <MagicTableBody
      {fields}
      {query}
      selectable
      bind:selected
      currency={$troc.currency}
      on:click={({ detail }) => {
        articleMenu.open(detail.item, detail.clickEvent)
      }}
    />
  </MagicTableWrapper>
</div>

<style>
  .select-cell {
    width: 40px;
    padding-right: 0;
  }
</style>
