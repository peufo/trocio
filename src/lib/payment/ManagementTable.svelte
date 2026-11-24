<script lang="ts">
  import { params } from '@roxi/routify'
  import { faDownload } from '@fortawesome/free-solid-svg-icons'

  import { ProgressCircular } from '$material'
  import { useApi, useInfinitApi } from '$lib/api'
  import MagicTableWrapper from '$lib/util/MagicTableWrapper.svelte'
  import MagicTableFieldSelect from '$lib/util/MagicTableFieldSelect.svelte'
  import MagicTableHeaders from '$lib/util/MagicTableHeaders.svelte'
  import MagicTableBody from '$lib/util/MagicTableBody.svelte'
  import IconLink from '$lib/util/IconLink.svelte'
  import type {
    IPaymentLookup,
    IPaymentResum,
    ParamsPaymentAPI,
  } from 'types'
  import layout, { isMobile } from '$lib/store/layout'
  import { troc } from '$lib/troc/store'
  import { getPaymentFields } from '$lib/payment/fields'
  import { renderAmount } from '$lib/utils'
  import downloadCSV from '$lib/downloadCSV'

  let fields = getPaymentFields($params.trocId)
  let queryParams = {}

  $: filterParams = {
    exact_trocId: $params.trocId,
    ...queryParams,
  } as ParamsPaymentAPI

  $: query = useInfinitApi<ParamsPaymentAPI, IPaymentLookup[]>([
    'payments',
    filterParams,
  ])

  $: resumQuery = useApi<ParamsPaymentAPI, IPaymentResum>([
    'payments/resum',
    filterParams,
  ])
  $: resum = $resumQuery.data

  let downloadPending = false
  async function handleDownload() {
    if (downloadPending) return
    downloadPending = true
    downloadCSV.trocPayments(filterParams).finally(() => {
      downloadPending = false
    })
  }
</script>

<div class="container">
  <div class="d-flex align-center mb-2" style="gap: 1em;">
    <h6>{$isMobile ? 'Paiements' : 'Gestion des paiements'}</h6>

    {#if resum}
      <div class="text-caption text--secondary resum">
        <span>
          {resum.count}
          {resum.count > 1 ? 'paiements' : 'paiement'} ·
          <b>{renderAmount(resum.sum, $troc.currency)}</b>
        </span>
        {#if !$isMobile}
          <span>
            · encaissé {renderAmount(resum.sumIn, $troc.currency)}
            · versé {renderAmount(resum.sumOut, $troc.currency)}
          </span>
        {/if}
      </div>
    {/if}

    <div class="flex-grow-1" />
    <div style:position="relative">
      <IconLink
        icon={faDownload}
        clickable
        size="18px"
        tip="Télécharger les paiements filtrés"
        on:click={handleDownload}
        style={downloadPending ? 'scale: 0.7; opacity: 0.7;' : ''}
      />
      {#if downloadPending}
        <ProgressCircular
          indeterminate
          size={36}
          style="position: absolute; left: 0; top: 0;"
        />
      {/if}
    </div>

    <MagicTableFieldSelect bind:fields />
  </div>

  <MagicTableWrapper
    {query}
    class="simple-card"
    style="
      min-height: 400px;
      max-height: {$layout.mainHeight - ($troc.is_try ? 124 : 76)}px;
    "
  >
    <thead>
      <tr>
        <MagicTableHeaders {fields} bind:queryParams />
      </tr>
    </thead>

    <MagicTableBody {fields} {query} currency={$troc.currency} />
  </MagicTableWrapper>
</div>

<style>
  .resum {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
</style>
