<script lang="ts">
  import { Table } from '$material'

  import type { IPaymentLookup } from 'types'
  import { renderAmount } from '$lib/utils'

  export let payments: IPaymentLookup[]
</script>

<Table>
  <thead>
    <tr>
      <th>Date du paiement</th>
      <th>Caissier</th>
      <th>Commentaire</th>
      <th>Montant</th>
    </tr>
  </thead>
  <tbody>
    {#each payments || [] as payment}
      <tr>
        <td>{new Date(payment.createdAt).toLocaleString()}</td>
        <td>{payment.acceptor.name}</td>
        <td>{@html (payment.message || '-').replaceAll('\n', '<br>')}</td>
        <td align="right">{renderAmount(payment.amount)}</td>
      </tr>
    {/each}
  </tbody>
</Table>

{#if !payments?.length}
  <div class="centered table-footer">
    <span class="text--secondary">Aucun paiement</span>
  </div>
{/if}
