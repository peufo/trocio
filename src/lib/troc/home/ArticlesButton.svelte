<script lang="ts">
  import { Button } from 'svelte-materialify'
  import { url } from '@roxi/routify'

  import type { ArticleState } from 'types'

  export let trocId: string
  export let state: ArticleState
  export let label: string
  export let count: number
</script>

<div data-state={state}>
  <a
    href={$url('/admin/management_articles', {
      trocId,
      exact_state: state,
    })}
  >
    <Button depressed class="d-flex" style="width: 100%;">
      {label}{count > 1 ? 's' : ''}
      <div class="flex-grow-1" />
      {count}
    </Button>
  </a>
</div>
