<script lang="ts">
  import { params } from '@roxi/routify'
  import { ButtonGroup, ButtonGroupItem } from 'svelte-materialify/src'

  import { useApi } from '$lib/api'
  import { syntaxHighlight } from '$lib/utils'
  import Loader from '$lib/util/Loader.svelte'
  import type { ISubscribe } from 'types'

  let modeTable = true

  $: query = useApi<{ trocId: string }, ISubscribe[]>([
    'root/subscribes',
    {
      trocId: $params.trocId,
    },
  ])

  $: keys = $query.data ? Object.keys($query.data[0]) : []
</script>

<ButtonGroup>
  <ButtonGroupItem on:click={() => (modeTable = false)}>JSON</ButtonGroupItem>
  <ButtonGroupItem on:click={() => (modeTable = true)}>Table</ButtonGroupItem>
</ButtonGroup>

{#if $query.isLoading}
  <Loader />
{:else if modeTable}
  <div class="wrapper">
    <table>
      <thead>
        {#each keys as key}
          <th>{key}</th>
        {/each}
      </thead>
      <tbody>
        {#each $query.data || [] as sub}
          <tr>
            {#each keys as key}
              <td>{sub[key]}</td>
            {/each}
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
{:else}
  <pre>
        {@html syntaxHighlight(JSON.stringify($query.data, null, 2))}
    </pre>
{/if}

<style>
  .wrapper {
    border: solid #ccc 1px;
    border-radius: 4px;
    margin: auto;
    max-width: 1200px;
    overflow-y: auto;
  }
</style>
