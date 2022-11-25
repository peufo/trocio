import type { FieldInteface, TrocLookup } from 'types'
import { ROLES } from '$lib/user/roles'
import { faCheck, faTimes } from '@fortawesome/free-solid-svg-icons'

export function getFields(troc: TrocLookup): FieldInteface[] {
  return [
    {
      label: 'Nom',
      disabled: true,
      queryKey: 'name',
      cellWidth: 50,
      getValue: (sub) => sub.user?.name || sub.name,
    },
    {
      label: 'Mail',
      disabled: true,
      queryKey: 'mail',
      cellWidth: 50,
      getValue: (sub) => sub.user?.mail || '',
    },
    {
      label: 'Rôle',
      queryKey: 'role',
      type: 'enum',
      getValue: (sub) =>
        sub.userId ? ROLES.find((r) => r.value === sub.role)?.label : '',
      enumOptions: [{ value: null, label: 'Tous' }, ...ROLES],
    },
    {
      label: `Validé par l'utilisateur`,
      hidden: true,

      queryKey: 'validedByUser',
      type: 'enum',
      cellWidth: 50,
      enumOptions: [
        { value: null, label: 'Tous' },
        {
          value: true,
          label: 'Oui',
          icon: faCheck,
          iconStyle: 'color: green;',
        },
        { value: false, label: 'Non', icon: faTimes, iconStyle: 'color: red;' },
      ],
    },
    {
      label: 'Tarif',
      queryKey: 'tarifId',
      type: 'enum',
      getValue: (sub) =>
        troc?.tarif.find((tarif) => tarif._id === sub.tarifId)?.name,
      enumOptions: [
        { value: null, label: 'Tous' },
        ...troc?.tarif.map((tarif) => ({
          label: tarif.name,
          key: tarif._id!,
        })),
      ],
    },
    {
      label: 'Solde',
      queryKey: 'resum.balance',
      type: 'currency',
      getValue: (sub) => sub.resum?.balance,
    },
    {
      label: 'Frais',
      queryKey: 'resum.feeSum',
      type: 'currency',
      getValue: (sub) => sub.resum?.feeSum,
    },
    {
      label: 'Marge',
      queryKey: 'resum.marginSum',
      type: 'currency',
      getValue: (sub) => sub.resum?.marginSum,
    },
    {
      label: `Nombre d'achats`,
      queryKey: 'resum.purchasesCount',
      type: 'number',
      getValue: (sub) => sub.resum?.purchasesCount,
    },
    {
      label: 'Somme des achats',
      hidden: true,
      queryKey: 'resum.purchasesSum',
      type: 'currency',
      getValue: (sub) => sub.resum?.purchasesSum,
    },
    {
      label: 'Nombre de paiements',
      hidden: true,
      queryKey: 'resum.paymentsCount',
      type: 'number',
      getValue: (sub) => sub.resum?.paymentsCount,
    },
    {
      label: 'Somme des paiements',
      hidden: true,
      queryKey: 'resum.paymentsSum',
      type: 'currency',
      getValue: (sub) => sub.resum?.paymentsSum,
    },
    {
      label: `Nombre d'articles`,
      hidden: true,
      queryKey: 'resum.articleCount',
      type: 'number',
      getValue: (sub) => sub.resum?.articleCount,
    },
    {
      label: `Nombre d'articles proposés`,
      hidden: true,
      queryKey: 'resum.proposedCount',
      type: 'number',
      getValue: (sub) => sub.resum?.proposedCount,
    },
    {
      label: 'Somme des articles proposés',
      hidden: true,
      queryKey: 'resum.proposedSum',
      type: 'currency',
      getValue: (sub) => sub.resum?.proposedSum,
    },
    {
      label: `Nombre d'articles en ventes`,
      queryKey: 'resum.validedCount',
      type: 'number',
      getValue: (sub) => sub.resum?.validedCount,
    },
    {
      label: 'Somme des articles en ventes',
      hidden: true,
      queryKey: 'resum.validedSum',
      type: 'currency',
      getValue: (sub) => sub.resum?.validedSum,
    },
    {
      label: 'Nombre de ventes',
      hidden: true,
      queryKey: 'resum.soldCount',
      type: 'number',
      getValue: (sub) => sub.resum?.soldCount,
    },
    {
      label: 'Somme des ventes',
      hidden: true,
      queryKey: 'resum.soldSum',
      type: 'currency',
      getValue: (sub) => sub.resum?.soldSum,
    },
  ]
}
