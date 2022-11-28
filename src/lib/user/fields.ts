import type { TrocLookup } from 'types'
import type { FieldInteface } from 'types/magic'
import { ROLES } from '$lib/user/roles'

export function getFields(troc: TrocLookup): FieldInteface[] {
  return [
    {
      label: 'Nom',
      disabled: true,
      key: 'name',
      cellWidth: 50,
      getValue: (sub) => sub.user?.name || sub.name,
    },
    {
      label: 'Mail',
      disabled: true,
      key: 'mail',
      cellWidth: 50,
      getValue: (sub) => sub.user?.mail || '',
    },
    {
      label: 'Rôle',
      key: 'role',
      type: 'select',
      getValue: (sub) =>
        sub.userId ? ROLES.find((r) => r.value === sub.role)?.label : '',
      options: [{ value: null, label: 'Tous' }, ...ROLES],
    },
    {
      label: `Validé par l'utilisateur`,
      hidden: true,
      key: 'validedByUser',
      type: 'boolean',
      cellWidth: 50,
    },
    {
      label: 'Tarif',
      key: 'tarifId',
      type: 'select',
      getValue: (sub) =>
        troc?.tarif.find((tarif) => tarif._id === sub.tarifId)?.name,
      options: [
        { value: null, label: 'Tous' },
        ...troc?.tarif.map((tarif) => ({
          label: tarif.name,
          value: tarif._id!,
        })),
      ],
    },
    {
      label: 'Solde',
      key: 'resum.balance',
      type: 'currency',
      getValue: (sub) => sub.resum?.balance,
    },
    {
      label: 'Frais',
      key: 'resum.feeSum',
      type: 'currency',
      getValue: (sub) => sub.resum?.feeSum,
    },
    {
      label: 'Marge',
      key: 'resum.marginSum',
      type: 'currency',
      getValue: (sub) => sub.resum?.marginSum,
    },
    {
      label: `Nombre d'achats`,
      key: 'resum.purchasesCount',
      type: 'number',
      getValue: (sub) => sub.resum?.purchasesCount,
    },
    {
      label: 'Somme des achats',
      hidden: true,
      key: 'resum.purchasesSum',
      type: 'currency',
      getValue: (sub) => sub.resum?.purchasesSum,
    },
    {
      label: 'Nombre de paiements',
      hidden: true,
      key: 'resum.paymentsCount',
      type: 'number',
      getValue: (sub) => sub.resum?.paymentsCount,
    },
    {
      label: 'Somme des paiements',
      hidden: true,
      key: 'resum.paymentsSum',
      type: 'currency',
      getValue: (sub) => sub.resum?.paymentsSum,
    },
    {
      label: `Nombre d'articles`,
      hidden: true,
      key: 'resum.articleCount',
      type: 'number',
      getValue: (sub) => sub.resum?.articleCount,
    },
    {
      label: `Nombre d'articles proposés`,
      hidden: true,
      key: 'resum.proposedCount',
      type: 'number',
      getValue: (sub) => sub.resum?.proposedCount,
    },
    {
      label: 'Somme des articles proposés',
      hidden: true,
      key: 'resum.proposedSum',
      type: 'currency',
      getValue: (sub) => sub.resum?.proposedSum,
    },
    {
      label: `Nombre d'articles en ventes`,
      key: 'resum.validedCount',
      type: 'number',
      getValue: (sub) => sub.resum?.validedCount,
    },
    {
      label: 'Somme des articles en ventes',
      hidden: true,
      key: 'resum.validedSum',
      type: 'currency',
      getValue: (sub) => sub.resum?.validedSum,
    },
    {
      label: 'Nombre de ventes',
      hidden: true,
      key: 'resum.soldCount',
      type: 'number',
      getValue: (sub) => sub.resum?.soldCount,
    },
    {
      label: 'Somme des ventes',
      hidden: true,
      key: 'resum.soldSum',
      type: 'currency',
      getValue: (sub) => sub.resum?.soldSum,
    },
  ]
}
