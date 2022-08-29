<script lang="ts">
  import { createEventDispatcher } from 'svelte'
  import { fade, slide } from 'svelte/transition'
  import { Dialog, Button, Textarea, TextField } from 'svelte-materialify'
  import { useMutation, useQueryClient } from '@sveltestack/svelte-query'
  import {
    faCircleNotch,
    faList,
    faPlus,
    faTimes,
  } from '@fortawesome/free-solid-svg-icons'

  import IconLink from '$lib/util/IconLink.svelte'
  import type { Article, ArticleCreate, ISubscribe } from 'types'
  import { api, useApi } from '$lib/api'
  import notify from '$lib/notify'

  const queryClient = useQueryClient()
  export let subscribeId: string
  export let active = false
  export let listMode = false
  export let disabled = false
  export let fullscreen = false

  let newName = ''
  let newPrice = ''
  /** Contenu de la textarea en mode list */
  let newArticles = ''
  let listArticles: ArticleCreate[] = []
  let listArticlesError = ''

  const dispatch = createEventDispatcher<{
    open: null
    close: null
    createArticle: Article
    createArticles: Article[]
  }>()

  let textarea: HTMLTextAreaElement | undefined

  $: querySubscribe = useApi<{ subscribeId: string }, ISubscribe>([
    'subscribes/byId',
    { subscribeId },
  ])
  $: prefix = $querySubscribe.data?.prefix || ''

  $: listPlaceHolder = `\n\t-- Glissez ou copiez une liste depuis un tableur --\n\t-- ${
    prefix ? '[ Référence ] ' : ''
  }[ Désignation ] [ Prix ] --\n\n\n${
    prefix ? `${prefix}1 ⭢ ` : ''
  } Mon premier article ⭢ 20\n${
    prefix ? `${prefix}2 : ` : ''
  } Mon deuxième article : 15.35\n${
    prefix ? `${prefix}3 ; ` : ''
  } Mon troisième article ; 5,40\n ...`

  function handleClicOpen() {
    if (disabled) return notify.warning(`Ajout d'article impossible`)
    dispatch('open')
    active = true
  }

  function handleClose() {
    dispatch('close')
    active = false
  }

  const createArticle = useMutation(
    (article: ArticleCreate) =>
      api<ArticleCreate, Article>('/api/articles', {
        method: 'post',
        data: article,
        success: 'Article ajouté',
      }),
    {
      onSuccess: (article) => {
        dispatch('createArticle', article)
        newName = ''
        newPrice = ''
        textarea?.focus()
        queryClient.invalidateQueries('articles')
        queryClient.invalidateQueries('subscribes/resum')
        queryClient.invalidateQueries('trocs/byId/counters')
      },
    }
  )

  const createArticles = useMutation(
    (articles: ArticleCreate[]) =>
      api<ArticleCreate[], Article[]>('/api/articles', {
        method: 'post',
        data: articles,
        success: `${articles.length} article${
          articles.length > 1 ? 's' : ''
        } ajouté${articles.length > 1 ? 's' : ''}`,
      }),
    {
      onSuccess: (articles) => {
        dispatch('createArticles', articles)
        newArticles = ''
        listArticles = []
        listArticlesError = ''
        queryClient.invalidateQueries('articles')
        queryClient.invalidateQueries('subscribes/resum')
      },
    }
  )

  /**
   * Parse la chaîne de la textarea en liste d'articles.
   * Si la chaîne est invalide, l'erreur est renvoyer dans listArticlesError
   */
  function handleInputList() {
    let value = newArticles
    listArticles = []
    listArticlesError = ''

    //Input Value parser
    if (value.trim().length) {
      let lines = value.split(/[\r\n]/)
      // Utilsateur simple
      if (!prefix) lines.forEach(parseLine)
      // Commerçants
      else lines.forEach(parseLineWithPrefix)
    }
  }

  function parseLine(line: string, index: number) {
    if (!line.length) return
    const cells = line.split(/[\t:;]/)
    if (cells.length !== 2)
      return (listArticlesError = `L'article n°${index + 1} n'est pas valide !`)

    const name = cells[0].trim()
    const price = Number(cells[1].replace(/,/, '.'))
    if (isNaN(price))
      return (listArticlesError = `Le prix de l'article n°${
        index + 1
      } est invalide.`)
    if (name.length < 3)
      return (listArticlesError = `Le nom de l'article n°${
        index + 1
      } est trop court.`)

    listArticles.push({
      name,
      price,
      providerSubId: subscribeId,
    })
  }

  function parseLineWithPrefix(line: string, index: number) {
    if (!line.length) return
    const cells = line.split(/[\t:;]/)
    if (cells.length !== 3) {
      listArticlesError = `L'article n°${index + 1} n'est pas valide !`
      return
    }
    const ref = cells[0].trim()
    const name = cells[1].trim()
    const price = Number(cells[2].replace(/,/, '.'))

    if (ref.indexOf(prefix) !== 0)
      return (listArticlesError = `La référence de l'article n°${
        index + 1
      } doit commencer le prefix "${prefix}"`)
    if (isNaN(Number(ref.replace(prefix, ''))) || ref.includes('.'))
      return (listArticlesError = `La référence de l'article n°${
        index + 1
      } doit contenir un nombre après le préfixe !`)
    if (isNaN(price))
      return (listArticlesError = `Le prix de l'article n°${
        index + 1
      } est invalide.`)
    if (name.length < 3)
      return (listArticlesError = `Le nom de l'article n°${
        index + 1
      } est trop court.`)

    if (listArticles.map(({ ref }) => ref).includes(ref))
      return (listArticlesError = `Le référence de l'article n°${
        index + 1
      } est utilisé deux fois.`)

    listArticles.push({
      ref,
      name,
      price,
      providerSubId: subscribeId,
    })
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
      <IconLink icon={faTimes} on:click={handleClose} clickable />
    {/if}
  </div>

  {#if listMode}
    <form
      in:fade|local
      on:submit|preventDefault={() => $createArticles.mutate(listArticles)}
    >
      <Textarea
        on:input={handleInputList}
        bind:value={newArticles}
        bind:textarea
        rows={10}
        placeholder={listPlaceHolder}
        error={!!listArticlesError}
        hint={listArticlesError}
      >
        Liste d'articles
      </Textarea>

      {#if !listArticlesError && listArticles.length}
        <div transition:slide|local class="text-right">
          {#if $createArticles.isLoading}
            <Button outlined disabled>
              <IconLink
                icon={faCircleNotch}
                spin
                opacity
                size="1.1em"
                class="mr-2"
              />
              Chargement
            </Button>
          {:else if $createArticles.isError}
            <div>Oups, une erreur c'est produite</div>
          {:else}
            <Button class="primary-color" type="submit">
              Valider {listArticles.length > 1
                ? `les ${listArticles.length} articles`
                : `l'article`}
            </Button>
          {/if}
        </div>
      {/if}
    </form>
  {:else}
    <form
      in:fade|local
      on:submit|preventDefault={() =>
        $createArticle.mutate({
          name: newName,
          price: +newPrice,
          providerSubId: subscribeId,
        })}
    >
      <Textarea bind:value={newName} rows={2} autogrow bind:textarea>
        Désignation
      </Textarea>

      <div class="d-flex mt-3">
        <TextField
          bind:value={newPrice}
          type="number"
          min="0"
          rules={[(value) => +value >= 0 || 'Le prix doit être positif']}
        >
          Prix
        </TextField>

        <div class="flex-grow-1" />

        {#if $createArticle.isLoading}
          <Button outlined disabled>
            <IconLink
              icon={faCircleNotch}
              spin
              opacity
              size="1.1em"
              class="mr-2"
            />
            Chargement
          </Button>
        {:else}
          <Button class="primary-color" type="submit">Valider</Button>
        {/if}
      </div>
    </form>
  {/if}
  <div class="d-flex mt-2">
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
