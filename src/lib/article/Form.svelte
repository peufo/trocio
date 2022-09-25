<script lang="ts">
  import { onMount, createEventDispatcher } from 'svelte'
  import { fade } from 'svelte/transition'
  import { Button, Textarea, TextField } from 'svelte-materialify'
  import { useMutation, useQueryClient } from '@sveltestack/svelte-query'
  import { faCircleNotch } from '@fortawesome/free-solid-svg-icons'

  import IconLink from '$lib/util/IconLink.svelte'
  import type { Article, ArticleCreate } from 'types'
  import { api } from '$lib/api'
  import notify from '$lib/notify'

  const queryClient = useQueryClient()
  export let subscribeId: string = ''
  export let article: Article | undefined = undefined

  let newName = ''
  let newPrice = ''
  let textarea: HTMLTextAreaElement | undefined
  const dispatch = createEventDispatcher<{ done: Article }>()

  onMount(() => {
    textarea?.focus()
    if (!article) return
    newName = article.name
    newPrice = article.price.toFixed(2)
  })

  async function handleSubmit() {
    if (!article && !subscribeId)
      return notify.error('subscribeId or article is required')

    if (!article)
      return done(
        await $createArticle.mutateAsync({
          name: newName,
          price: +newPrice,
          providerSubId: subscribeId,
        })
      )

    const isNameEdited = newName !== article.name
    const isPriceEdited = +newPrice !== article.price
    if (!isNameEdited && !isPriceEdited)
      return notify.warning('Aucune modification !')
    const articleId = article._id
    const requests: Promise<any>[] = []
    if (isNameEdited)
      requests.push($queryEditName.mutateAsync({ articleId, newName }))
    if (isPriceEdited)
      requests.push($queryEditPrice.mutateAsync({ articleId, newPrice }))
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
    (data: { articleId: string; newName: string }) =>
      api('/api/articles/edit-name', {
        method: 'post',
        data,
        success: 'Nom modifé',
      }),
    {
      onSuccess: (newArticle) => {
        // @ts-ignore
        article.name = newArticle.name
      },
    }
  )

  const queryEditPrice = useMutation(
    (data: { articleId: string; newPrice: string }) =>
      api('/api/articles/edit-price', {
        method: 'post',
        data,
        success: 'Prix mis à jour',
      }),
    {
      onSuccess: (newArticle) => {
        // @ts-ignore
        article.price = newArticle.price
      },
    }
  )
</script>

<form in:fade|local on:submit|preventDefault={handleSubmit}>
  <Textarea bind:value={newName} rows={2} autogrow bind:textarea>
    Désignation
  </Textarea>

  <div class="d-flex mt-3">
    <TextField
      bind:value={newPrice}
      type="number"
      min={0}
      step={0.01}
      rules={[(value) => +value >= 0 || 'Le prix doit être positif']}
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
      <Button class="primary-color" type="submit">Valider</Button>
    {/if}
  </div>
</form>