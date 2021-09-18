<script lang="ts">
  import { fade, slide } from 'svelte/transition'
  import { Dialog, Button, Textarea, TextField } from 'svelte-materialify'

  import { useCreateArticle, useCreateArticles } from '$lib/article/store'
  import IconLink from '$lib/util/IconLink.svelte'
  import {
    faCircleNotch,
    faList,
    faPlus,
  } from '@fortawesome/free-solid-svg-icons'
  import type { ArticleCreate } from 'types'

  export let trocId: string
  export let dialogActive = false
  export let listMode = false
  export let prefix = ''
  /** Si le client n'est pas définit, c'est l'utilisateur connecté qui est le fournisseur*/
  export let client = ''

  let newName = ''
  let newPrice: number

  let listArticles: ArticleCreate[] = []
  let listArticlesError = ''

  $: listPlaceHolder = `\n\t-- Glissez ou copiez une liste depuis un tableur --\n\t-- ${
    prefix ? '[ Référence ] ' : ''
  }[ Désignation ] [ Prix ] --\n\n\n${
    prefix ? `${prefix}1 ⭢ ` : ''
  } Mon premier article ⭢ 20\n${
    prefix ? `${prefix}2 : ` : ''
  } Mon deuxième article : 15.35\n${
    prefix ? `${prefix}3 ; ` : ''
  } Mon troisième article ; 5,40\n ...`

  const createArticle = useCreateArticle()
  const createArticles = useCreateArticles()

  /**
   * Parse la chaîne de la textarea en liste d'articles.
   * Si la chaîne est invalide, l'erreur est renvoyer dans listArticlesError
   */
  function handleInputList(event) {
    let value = event.target.value

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
      troc: trocId,
      provider: client,
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
      troc: trocId,
      provider: client,
    })
  }
</script>

<Dialog bind:active={dialogActive} class="pa-4">
  <div class="d-flex justify-space-between mb-3">
    <div class="text-h6">
      Proposer {listMode ? `une liste d'` : 'un '}article
    </div>

    <Button text size="small" on:click={() => (listMode = !listMode)}>
      <IconLink
        icon={!listMode ? faList : faPlus}
        opacity
        size="1em"
        class="mr-2"
      />
      {!listMode ? 'Charger une liste' : 'Un seul article'}
    </Button>
  </div>

  {#if listMode}
    <div in:fade|local>
      <Textarea
        on:input={handleInputList}
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
            <Button
              class="primary-color"
              on:click={() => $createArticles.mutate(listArticles)}
            >
              Valider {listArticles.length > 1
                ? `les ${listArticles.length} articles`
                : `l'article`}
            </Button>
          {/if}
        </div>
      {/if}
    </div>
  {:else}
    <div in:fade|local>
      <Textarea bind:value={newName} rows={2} autogrow>Désignation</Textarea>

      <div class="d-flex mt-3">
        <TextField bind:value={newPrice} type="number" min="0">Prix</TextField>

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
        {:else if $createArticle.isError}
          <div>Oups, une erreur c'est produite</div>
        {:else}
          <Button
            class="primary-color"
            on:click={() =>
              $createArticle.mutate({
                name: newName,
                price: newPrice,
                troc: trocId,
                provider: client,
              })}
          >
            Valider
          </Button>
        {/if}
      </div>
    </div>
  {/if}
</Dialog>
