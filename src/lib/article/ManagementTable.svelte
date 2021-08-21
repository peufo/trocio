<script lang="ts">
  import MagicTable from '$lib/util/MagicTable.svelte'

  const statutFiltersOptions = [
    { queryValue: '', label: 'Tous', icon: '' },
    {
      queryValue: 'proposed',
      label: 'Proposé',
      icon: '<i class="fas fa-dot-circle w3-text-light-grey"></i>',
    },
    {
      queryValue: 'valided',
      label: 'Validé',
      icon: '<i class="fas fa-dot-circle w3-text-blue"></i>',
    },
    {
      queryValue: 'refused',
      label: 'Refusé',
      icon: '<i class="fas fa-dot-circle w3-text-red"></i>',
    },
    {
      queryValue: 'sold',
      label: 'Vendu',
      icon: '<i class="fas fa-dot-circle w3-text-green"></i>',
    },
    {
      queryValue: 'recover',
      label: 'Récupéré',
      icon: '<i class="fas fa-dot-circle w3-text-orange"></i>',
    },
  ]

  const sortOptions = [
    { queryValue: '', label: 'Non trié', icon: '<i class="fas fa-bars"></i>' },
    {
      queryValue: '1',
      label: 'Croissant',
      icon: '<i class="fas fa-sort-amount-down-alt"></i>',
    },
    {
      queryValue: '-1',
      label: 'Décroissant',
      icon: '<i class="fas fa-sort-amount-down"></i>',
    },
  ]

  const fields = [
    {
      label: '#',
      checked: true,
      typeMenu: 'search',
      dataName: 'ref',
      dataType: 'string',
      cellWidth: 50,
      disabled: true,
    },
    {
      label: 'Désignation',
      checked: true,
      typeMenu: 'search',
      dataName: 'name',
      dataType: 'string',
      cellWidth: 300,
      disabled: true,
    },
    {
      label: 'Statut',
      checked: true,
      typeMenu: 'filter',
      dataName: 'statut',
      dataType: 'string',
      cellWidth: 90,
      options: statutFiltersOptions,
    },
    {
      label: 'Création',
      checked: false,
      typeMenu: 'sort',
      dataName: 'createdAt',
      dataType: 'date',
      cellWidth: 170,
    },
    {
      label: 'Fournisseur',
      checked: true,
      typeMenu: 'user',
      dataName: 'provider.name',
      dataType: 'string',
      cellWidth: 70,
    },
    {
      label: 'Validation',
      checked: false,
      typeMenu: 'sort',
      dataName: 'valided',
      dataType: 'date',
      cellWidth: 170,
    },
    {
      label: 'Validateur',
      checked: false,
      typeMenu: 'user',
      dataName: 'validator.name',
      dataType: 'string',
      cellWidth: 50,
    },
    {
      label: 'Vente',
      checked: false,
      typeMenu: 'sort',
      dataName: 'sold',
      dataType: 'date',
      cellWidth: 170,
    },
    {
      label: 'Récupération',
      checked: false,
      typeMenu: 'sort',
      dataName: 'recover',
      dataType: 'date',
      cellWidth: 170,
    },
    {
      label: 'Caissier',
      checked: false,
      typeMenu: 'user',
      dataName: 'seller.name',
      dataType: 'string',
      cellWidth: 50,
    },
    {
      label: 'Client',
      checked: false,
      typeMenu: 'user',
      dataName: 'buyer.name',
      dataType: 'string',
      cellWidth: 50,
    },
    {
      label: 'Frais',
      checked: false,
      typeMenu: 'sort',
      dataName: 'fee',
      dataType: 'number',
      cellWidth: 50,
    },
    {
      label: 'Marge',
      checked: false,
      typeMenu: 'sort',
      dataName: 'margin',
      dataType: 'number',
      cellWidth: 50,
    },
    {
      label: 'Prix',
      checked: true,
      typeMenu: 'sort',
      dataName: 'price',
      dataType: 'number',
      cellWidth: 50,
    },
  ].map((field) => {
    field.queryValue = ''
    field.queryLabel = ''
    field.queryIcon = ''
    if (field.typeMenu == 'sort') field.options = sortOptions
    if (field.typeMenu == 'user')
      field.queryIcon = '<i class="far fa-user"></i>'
    return field
  })
</script>

<div class="container">
  <h6 class="mb-5">Gestion des articles</h6>

  <MagicTable />
</div>
