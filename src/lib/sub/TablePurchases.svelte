<script lang="ts">
  import { Table } from 'svelte-materialify'

  import type { Article } from 'types'
  import { renderAmount } from '$lib/utils'

  export let purchases: Article[]
</script>

<Table class="pb-2">
  <thead>
    <tr>
      <th>Date de l'achat</th>
      <th>Référence</th>
      <th>Nom</th>
      <th>Prix</th>
    </tr>
  </thead>
  <tbody>
    {#each purchases || [] as article}
      <tr>
        <td>{new Date(article.sold || '').toLocaleString()}</td>
        <td>{article.ref}</td>
        <td>{article.name}</td>
        <td align="right">{renderAmount(article.price)}</td>
      </tr>
    {/each}
  </tbody>
</Table>

{#if !purchases?.length}
  <div class="centered table-footer">
    <span class="text--secondary">Aucun achat</span>
  </div>
{/if}
