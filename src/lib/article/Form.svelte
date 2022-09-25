<script lang="ts">
  import { createEventDispatcher } from 'svelte'
  import { fade } from 'svelte/transition'
  import { Button, Textarea, TextField } from 'svelte-materialify'
  import { useMutation, useQueryClient } from '@sveltestack/svelte-query'
  import { faCircleNotch } from '@fortawesome/free-solid-svg-icons'

  import IconLink from '$lib/util/IconLink.svelte'
  import type { Article, ArticleCreate } from 'types'
  import { api } from '$lib/api'

  const queryClient = useQueryClient()
  export let subscribeId: string

  let newName = ''
  let newPrice = ''
  let textarea: HTMLTextAreaElement | undefined

  const dispatch = createEventDispatcher<{
    done: Article
  }>()

  const createArticle = useMutation(
    (article: ArticleCreate) =>
      api<ArticleCreate, Article>('/api/articles', {
        method: 'post',
        data: article,
        success: 'Article ajouté',
      }),
    {
      onSuccess: (article) => {
        newName = ''
        newPrice = ''
        textarea?.focus()
        queryClient.invalidateQueries('articles')
        queryClient.invalidateQueries('subscribes/resum')
        queryClient.invalidateQueries('trocs/byId/counters')
        dispatch('done', article)
      },
    }
  )
</script>

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
