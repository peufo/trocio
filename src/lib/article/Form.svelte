<script lang="ts">
  import { onMount, createEventDispatcher } from 'svelte'
  import { fade } from 'svelte/transition'
  import { Button, Textarea, TextField } from '$material'
  import { useMutation, useQueryClient } from '@sveltestack/svelte-query'
  import { faCircleNotch } from '@fortawesome/free-solid-svg-icons'

  import IconLink from '$lib/util/IconLink.svelte'
  import type { Article, ArticleCreate } from 'types'
  import { api } from '$lib/api'
  import notify from '$lib/notify'

  const queryClient = useQueryClient()
  export let subscribeId = ''
  export let article: Article | undefined = undefined
  export let actionName = 'Valider'

  let newName = ''
  let newPrice = ''
  let textarea: HTMLTextAreaElement
  const dispatch = createEventDispatcher<{ done: Article }>()

  onMount(() => {
    textarea?.focus()
    if (!article) return
    newName = article.name
    newPrice = article.price.toFixed(2)
  })

  async function handleSubmit() {
    if (!article && !subscribe._id)
      return notify.error('subscribeId or article is required')

    if (!article)
      return done(
        await $createArticle.mutateAsync({
          name: newName,
          price: +newPrice,
          providerSubId: subscribe._id,
        })
      )

    const isNameEdited = newName !== article.name
    const isPriceEdited = +newPrice !== article.price
    if (!isNameEdited && !isPriceEdited)
      return notify.warning('Aucune modification !')
    const articleId = article._id
    const requests: Promise<any>[] = []
    if (isNameEdited)
      requests.push($queryEditName.mutateAsync({ articleId, name: newName }))
    if (isPriceEdited)
      requests.push(
        $queryEditPrice.mutateAsync({ articleId, price: +newPrice })
      )
    await Promise.all(requests)
    done({ ...article, name: newName, price: +newPrice })
  }

  function done(data: Article) {
    dispatch('done', data)
    queryClient.invalidateQueries('articles')
    queryClient.invalidateQueries('articles/corrections')
    queryClient.invalidateQueries('subscribes/resum')
    queryClient.invalidateQueries('trocs/byId/counters')
  }

  const createArticle = useMutation(
    (data: ArticleCreate) =>
      api<ArticleCreate, Article>('/api/articles', {
        method: 'post',
        data,
        success: 'Article ajouté',
      }),
    {
      onSuccess: (data) => {
        newName = ''
        newPrice = ''
        textarea?.focus()
      },
    }
  )

  const queryEditName = useMutation(
    (data: { articleId: string; name: string }) =>
      api('/api/articles/edit-name', {
        method: 'post',
        data,
        success: 'Nom modifé',
      }),
    {
      onSuccess: (newArticle) => {
        if (!article) return
        article.name = newArticle.name
      },
    }
  )

  const queryEditPrice = useMutation(
    (data: { articleId: string; price: number }) =>
      api('/api/articles/edit-price', {
        method: 'post',
        data,
        success: 'Prix mis à jour',
      }),
    {
      onSuccess: (newArticle) => {
        if (!article) return
        article.price = newArticle.price
      },
    }
  )
</script>

<form in:fade|local on:submit|preventDefault={handleSubmit}>
  <Textarea
    bind:value={newName}
    rows={2}
    autogrow
    bind:textarea
    color="secondary"
  >
    Désignation
  </Textarea>

  <div class="d-flex mt-3" style="gap: 0.5em;">
    <TextField
      bind:value={newPrice}
      type="number"
      min="0"
      step="0.01"
      rules={[(value) => +value >= 0 || 'Le prix doit être positif']}
      color="secondary"
    >
      Prix
    </TextField>

    <div class="flex-grow-1" />

    {#if $createArticle.isLoading}
      <Button outlined disabled>
        <IconLink icon={faCircleNotch} spin opacity size="1.1em" class="mr-2" />
        Chargement
      </Button>
    {:else}
      <Button class="primary-color" type="submit">{actionName}</Button>
    {/if}
  </div>
</form>
