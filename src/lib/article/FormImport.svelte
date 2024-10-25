<script lang="ts">
  import { createEventDispatcher } from 'svelte'
  import { Article } from 'types'

  export let subscribeId: string
  const dispatch = createEventDispatcher<{
    done: Article[]
  }>()
</script>

<h2>TODO: import from other trocs</h2>
