<script lang="ts">
  import { slide } from 'svelte/transition'
  import { Button } from 'svelte-materialify'
  import type { MutationStoreResult } from '@sveltestack/svelte-query'
  import Loader from './Loader.svelte'

  export let visible = false
  export let updateQuery: MutationStoreResult<any, unknown, any>
  export let clickHandler = $updateQuery.mutate
</script>

{#if visible}
  <div transition:slide|local class="d-flex">
    <div class="flex-grow-1" />
    <Button disabled={$updateQuery.isLoading} on:click={clickHandler}>
      {#if $updateQuery.isLoading}
        <Loader title="Validation" />
      {:else}
        Valider la modification
      {/if}
    </Button>
    <br /><br />
  </div>
{/if}
