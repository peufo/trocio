<script lang="ts">
  import { Table } from 'svelte-materialify'

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
        <td>{payment.message || '-'}</td>
        <td align="right">{renderAmount(payment.amount)}</td>
      </tr>
    {/each}
  </tbody>
  {#if !payments?.length}
    <div class="text-center pa-12 text--secondary">Aucun paiement</div>
  {/if}
</Table>
