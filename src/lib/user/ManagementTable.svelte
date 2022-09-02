<script lang="ts">
  import { params } from '@roxi/routify'

  import { useInfinitApi } from '$lib/api'
  import MagicTable from '$lib/util/MagicTable.svelte'
  import MagicTableFieldSelect from '$lib/util/MagicTableFieldSelect.svelte'
  import MagicTableHeaders from '$lib/util/MagicTableHeaders.svelte'
  import MagicTableBody from '$lib/util/MagicTableBody.svelte'
  import type {
    FieldInteface,
    SubscribeLookup,
    ParamsSubscribeAPI,
  } from 'types'
  import layout from '$lib/store/layout'
  import SearchTextField from '$lib/util/SearchTextField.svelte'
  import { troc } from '$lib/troc/store'
  import { ROLES } from '$lib/user/roles'
  import SubscribeMenu from '$lib/user/SubscribeMenu.svelte'
  import { faCheck, faTimes } from '@fortawesome/free-solid-svg-icons'
  let subscribeMenu: SubscribeMenu

  let searchValue = ''
  let queryParams = {}

  $: query = useInfinitApi<ParamsSubscribeAPI, SubscribeLookup[]>([
    'subscribes',
    {
      exact_trocId: $params.trocId,
      q: searchValue,
      includResum: true,
      ...queryParams,
    },
  ])

  let fields: FieldInteface[] = [
    {
      label: 'Nom',
      visible: true,
      disabled: true,
      queryKey: 'name',
      format: 'string',
      cellWidth: 50,
      getValue: (sub) => sub.user?.name || sub.name,
    },
    {
      label: 'Mail',
      visible: true,
      disabled: true,
      queryKey: 'mail',
      format: 'string',
      cellWidth: 50,
      getValue: (sub) => sub.user?.mail || '',
    },
    {
      label: 'Rôle',
      visible: true,
      queryKey: 'role',
      format: 'enum',
      getValue: (sub) =>
        sub.userId ? ROLES.find((r) => r.key === sub.role)?.label : '',
      enumOptions: [{ key: null, label: 'Tous' }, ...ROLES],
    },
    {
      label: `Validé par l'utilisateur`,
      visible: false,
      queryKey: 'validedByUser',
      format: 'enum',
      cellWidth: 50,
      enumOptions: [
        { key: null, label: 'Tous' },
        { key: true, label: 'Oui', icon: faCheck, iconStyle: 'color: green;' },
        { key: false, label: 'Non', icon: faTimes, iconStyle: 'color: red;' },
      ],
    },
    {
      label: 'Tarif',
      visible: true,
      queryKey: 'tarifId',
      format: 'enum',
      getValue: (sub) =>
        $troc?.tarif.find((tarif) => tarif._id === sub.tarifId)?.name,
      enumOptions: [
        { key: null, label: 'Tous' },
        // @ts-ignore tarif._id can be undefined ...
        ...$troc?.tarif.map((tarif) => ({
          label: tarif.name,
          key: tarif._id,
        })),
      ],
    },
    {
      label: 'Solde',
      visible: true,
      queryKey: 'resum.balance',
      format: 'currency',
      getValue: (sub) => sub.resum?.balance,
    },
    {
      label: 'Frais',
      visible: true,
      queryKey: 'resum.feeSum',
      format: 'currency',
      getValue: (sub) => sub.resum?.feeSum,
    },
    {
      label: 'Marge',
      visible: true,
      queryKey: 'resum.marginSum',
      format: 'currency',
      getValue: (sub) => sub.resum?.marginSum,
    },
    {
      label: `Nombre d'achats`,
      visible: true,
      queryKey: 'resum.purchasesCount',
      format: 'number',
      getValue: (sub) => sub.resum?.purchasesCount,
    },
    {
      label: 'Somme des achats',
      visible: false,
      queryKey: 'resum.purchasesSum',
      format: 'currency',
      getValue: (sub) => sub.resum?.purchasesSum,
    },
    {
      label: 'Nombre de paiements',
      visible: false,
      queryKey: 'resum.paymentsCount',
      format: 'number',
      getValue: (sub) => sub.resum?.paymentsCount,
    },
    {
      label: 'Somme des paiements',
      visible: false,
      queryKey: 'resum.paymentsSum',
      format: 'currency',
      getValue: (sub) => sub.resum?.paymentsSum,
    },
    {
      label: `Nombre d'articles fournis`,
      visible: true,
      queryKey: 'resum.providedCount',
      format: 'number',
      getValue: (sub) => sub.resum?.providedCount,
    },
    {
      label: 'Somme des articles fournis',
      visible: false,
      queryKey: 'resum.providedSum',
      format: 'currency',
      getValue: (sub) => sub.resum?.providedSum,
    },
    {
      label: 'Nombre de ventes',
      visible: false,
      queryKey: 'resum.soldCount',
      format: 'number',
      getValue: (sub) => sub.resum?.soldCount,
    },
    {
      label: 'Somme des ventes',
      visible: false,
      queryKey: 'resum.soldSum',
      format: 'currency',
      getValue: (sub) => sub.resum?.soldSum,
    },
  ]
</script>

<SubscribeMenu bind:this={subscribeMenu} />

<div class="container">
  <div class="d-flex align-center">
    <h6 class="mb-5">Gestion des participants</h6>
    <div class="flex-grow-1" />
    <MagicTableFieldSelect bind:fields />
  </div>

  <MagicTable
    {query}
    class="simple-card"
    style="min-height: 400px; max-height: {$layout.mainHeight - 94}px;"
  >
    <thead>
      <tr>
        <th colspan="2" style="padding-left: 0px;">
          <SearchTextField
            bind:search={searchValue}
            placeholder="Chercher un participant"
            flat
            solo
            dense
          />
        </th>

        <MagicTableHeaders {fields} bind:queryParams />
      </tr>
    </thead>

    <MagicTableBody
      {fields}
      {query}
      currency={$troc.currency}
      on:click={({ detail }) =>
        subscribeMenu.open(detail.clickEvent, detail.item)}
    />
  </MagicTable>
</div>
