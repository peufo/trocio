<script lang="ts">
  import { createEventDispatcher } from 'svelte'
  import { Article } from 'types'
  import { useApi } from '$lib/api'

  export let subscribeId: string
  const dispatch = createEventDispatcher<{
    done: Article[]
  }>()

  $: queryArticles = useApi<{ subscribeId: string }, Article[]>([
    '/articles/importables',
    { subscribeId },
  ])
</script>

<div style="min-height: 260px;">
  <p>TODO: Lister les invendues</p>
  <pre>{JSON.stringify($queryArticles.data, null, 2)}</pre>
</div>
