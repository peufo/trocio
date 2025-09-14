<script lang="ts">
  import { Button } from "$lib/material";
  import { param } from "$lib/param";

  import type { ArticleState } from "$lib/types";

  export let trocId: string;
  export let state: ArticleState;
  export let label: string;
  export let count: number;
</script>

<div data-state={state}>
  <Button
    depressed
    class="d-flex"
    style="width: 100%;"
    href="/admin/management_articles{$param.withOnly({
      trocId,
      exact_state: state,
    })}"
  >
    {label}{count > 1 ? "s" : ""}
    <div class="flex-grow-1"></div>
    <span class="pl-1">{count}</span>
  </Button>
</div>
