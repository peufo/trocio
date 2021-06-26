<script lang="ts">
  import { slide } from 'svelte/transition'
  import { Button } from 'svelte-materialify'
  import type { MutationStoreResult } from '@sveltestack/svelte-query'

  export let visible = false
  export let updateQuery: MutationStoreResult<any, unknown, any>
  export let clickHandler = $updateQuery.mutate
</script>

{#if visible}
  <div transition:slide|local>
    <Button
      class="w3-right"
      disabled={$updateQuery.isLoading}
      on:click={clickHandler}
    >
      {#if $updateQuery.isLoading}
        <i class="fas fa-circle-notch w3-spin" />
        &nbsp;Validation ...
      {:else}
        Valider la modification
      {/if}
    </Button>
    <br /><br />
  </div>
{/if}
