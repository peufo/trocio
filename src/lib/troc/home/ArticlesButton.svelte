<script lang="ts">
  import { Button } from '$material'
  import { url } from '@roxi/routify'

  import type { ArticleState } from 'types'

  export let trocId: string
  export let state: ArticleState
  export let label: string
  export let count: number
</script>

<div data-state={state}>
  <Button
    depressed
    class="d-flex"
    style="width: 100%;"
    href={$url('/admin/management_articles', {
      trocId,
      exact_state: state,
    })}
  >
    {label}{count > 1 ? 's' : ''}
    <div class="flex-grow-1" />
    <span class="pl-1">{count}</span>
  </Button>
</div>
