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
      format: 'enum',
      getValue: (sub) =>
        sub.userId ? ROLES.find((r) => r.key === sub.role)?.label : '',
      enumOptions: [{ key: null, label: 'Tous' }, ...ROLES],
    },
    {
      label: `Validé par l'utilisateur`,
      hidden: true,
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
      queryKey: 'resum.balance',
      format: 'currency',
      getValue: (sub) => sub.resum?.balance,
    },
    {
      label: 'Frais',
      queryKey: 'resum.feeSum',
      format: 'currency',
      getValue: (sub) => sub.resum?.feeSum,
    },
    {
      label: 'Marge',
      queryKey: 'resum.marginSum',
      format: 'currency',
      getValue: (sub) => sub.resum?.marginSum,
    },
    {
      label: `Nombre d'achats`,
      queryKey: 'resum.purchasesCount',
      format: 'number',
      getValue: (sub) => sub.resum?.purchasesCount,
    },
    {
      label: 'Somme des achats',
      hidden: true,
      queryKey: 'resum.purchasesSum',
      format: 'currency',
      getValue: (sub) => sub.resum?.purchasesSum,
    },
    {
      label: 'Nombre de paiements',
      hidden: true,
      queryKey: 'resum.paymentsCount',
      format: 'number',
      getValue: (sub) => sub.resum?.paymentsCount,
    },
    {
      label: 'Somme des paiements',
      hidden: true,
      queryKey: 'resum.paymentsSum',
      format: 'currency',
      getValue: (sub) => sub.resum?.paymentsSum,
    },
    {
      label: `Nombre d'articles`,
      hidden: true,
      queryKey: 'resum.articleCount',
      format: 'number',
      getValue: (sub) => sub.resum?.articleCount,
    },
    {
      label: `Nombre d'articles proposés`,
      hidden: true,
      queryKey: 'resum.proposedCount',
      format: 'number',
      getValue: (sub) => sub.resum?.proposedCount,
    },
    {
      label: 'Somme des articles proposés',
      hidden: true,
      queryKey: 'resum.proposedSum',
      format: 'currency',
      getValue: (sub) => sub.resum?.proposedSum,
    },
    {
      label: `Nombre d'articles en ventes`,
      queryKey: 'resum.validedCount',
      format: 'number',
      getValue: (sub) => sub.resum?.validedCount,
    },
    {
      label: 'Somme des articles en ventes',
      hidden: true,
      queryKey: 'resum.validedSum',
      format: 'currency',
      getValue: (sub) => sub.resum?.validedSum,
    },
    {
      label: 'Nombre de ventes',
      hidden: true,
      queryKey: 'resum.soldCount',
      format: 'number',
      getValue: (sub) => sub.resum?.soldCount,
    },
    {
      label: 'Somme des ventes',
      hidden: true,
      queryKey: 'resum.soldSum',
      format: 'currency',
      getValue: (sub) => sub.resum?.soldSum,
    },
  ]
}
