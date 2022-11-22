import type { FieldInteface, TrocLookup } from 'types'
import { ROLES } from '$lib/user/roles'
import { faCheck, faTimes } from '@fortawesome/free-solid-svg-icons'

export function getFields(troc: TrocLookup): FieldInteface[] {
  return [
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
        troc?.tarif.find((tarif) => tarif._id === sub.tarifId)?.name,
      enumOptions: [
        { key: null, label: 'Tous' },
        ...troc?.tarif.map((tarif) => ({
          label: tarif.name,
          key: tarif._id!,
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
      label: `Nombre d'articles`,
      visible: false,
      queryKey: 'resum.articleCount',
      format: 'number',
      getValue: (sub) => sub.resum?.articleCount,
    },
    {
      label: `Nombre d'articles proposés`,
      visible: false,
      queryKey: 'resum.proposedCount',
      format: 'number',
      getValue: (sub) => sub.resum?.proposedCount,
    },
    {
      label: 'Somme des articles proposés',
      visible: false,
      queryKey: 'resum.proposedSum',
      format: 'currency',
      getValue: (sub) => sub.resum?.proposedSum,
    },
    {
      label: `Nombre d'articles en ventes`,
      visible: true,
      queryKey: 'resum.validedCount',
      format: 'number',
      getValue: (sub) => sub.resum?.validedCount,
    },
    {
      label: 'Somme des articles en ventes',
      visible: false,
      queryKey: 'resum.validedSum',
      format: 'currency',
      getValue: (sub) => sub.resum?.validedSum,
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
}
