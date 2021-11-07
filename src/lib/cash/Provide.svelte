<script lang="ts">
  import { fade } from 'svelte/transition'
  import { Button } from 'svelte-materialify'
  import MagicSelect from '$lib/util/MagicSelect.svelte'
  import { renderAmount } from '$lib/utils'
  import { troc } from '$lib/troc/store'
  import { api } from '$lib/api'
  import type { Article } from 'types'
  import { faTimes } from '@fortawesome/free-solid-svg-icons'
  import IconLink from '$lib/util/IconLink.svelte'
  import notify from '$lib/notify'
  import Loader from '$lib/util/Loader.svelte'

  export let subscribeId: string
  let magicSelect: MagicSelect
  let pendingArticles: Article[] = []
  let selectAllPromise: Promise<void>

  function handleSelectAll() {
    return api<Article[]>('/api/articles', {
      params: {
        exact_providerSubId: subscribeId,
        exact_statut: 'proposed',
        limit: 1000,
      },
    }).then((articles) => {
      pendingArticles = articles
      if (articles.length === 1000)
        notify.warning('Seul 1000 article peuvent être sélectionés')
    })
  }

  function handleSelect(event: { detail: Article }) {
    const article = event.detail
    setTimeout(magicSelect.focus, 250)
    if (pendingArticles.map(({ _id }) => _id).includes(article._id))
      return notify.warning('Article déjà sélectioné')
    setTimeout(() => {
      // Timeout nécéssaire pour éviter un double animation
      pendingArticles = [...pendingArticles, article]
    }, 200)
  }

  function handleRemove(index: number) {
    pendingArticles = [
      ...pendingArticles.slice(0, index),
      ...pendingArticles.slice(index + 1),
    ]
  }
</script>

<div class="pa-4">
  <div class="d-flex flex-wrap">
    <div class="flex-grow-1 mr-4" style="max-width: 320px;">
      <MagicSelect
        bind:this={magicSelect}
        path="articles"
        searchKey="q"
        placeholder="Articles proposés"
        queryParams={{ exact_providerSubId: subscribeId, limit: 10 }}
        getValue={(art) => `${art.ref} - ${art.name}`}
        getValue2={(art) => renderAmount(art.price, $troc.currency)}
        exepted={pendingArticles.map((art) => art._id)}
        on:select={handleSelect}
      />
    </div>

    {#await selectAllPromise}
      <Button disabled class="mt-1" style="width: 190px;">
        <Loader />
      </Button>
    {:then}
      <Button
        class="mt-1"
        depressed
        on:click={() => (selectAllPromise = handleSelectAll())}
      >
        Tout sélectionner
      </Button>
    {/await}

    <div class="flex-grow-1" />

    {#if pendingArticles.length}
      <div in:fade|locale>
        <Button class="red white-text mt-1">Refuser</Button>
        <Button class="primary-color mt-1">Valider la sélection</Button>
      </div>
    {/if}
  </div>

  <div class="mt-4">
    {#if pendingArticles.length}
      <div in:fade|local class="d-flex flex-wrap">
        {#each pendingArticles as article, index}
          <div
            class="d-flex simple-card pl-2 pr-2 pt-1 pb-1 ma-1"
            style="min-width: 200px; max-width: calc(50% - 8px);"
          >
            <div class="flex-grow-1">
              <span class="text-subtitle-2">{article.name}</span>
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
        Sélectionner des articles proposés par le client pour les valider ou les
        refuser.
      </div>
    {/if}
  </div>
</div>
