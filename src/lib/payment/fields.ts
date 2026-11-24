import { faDotCircle } from '@fortawesome/free-solid-svg-icons'
import type { IPaymentLookup } from 'types'
import type { FieldInteface } from 'types/magic'
import { selectAsyncUser } from '$lib/article/fields'

/** Montant positif : encaissé (client → troc), négatif : versé (troc → client) */
function getDirectionLabel(payment: IPaymentLookup) {
  if (payment.amount > 0) return 'Encaissé'
  if (payment.amount < 0) return 'Versé'
  return ''
}

export function getPaymentFields(
  trocId: string
): FieldInteface<IPaymentLookup>[] {
  return [
    {
      label: 'Date',
      key: 'createdAt',
      type: 'date',
      cellWidth: 170,
      disabled: true,
    },
    {
      label: 'Participant',
      key: 'userSubId',
      type: 'selectAsync',
      getValue: (payment) => payment.user?.name || payment.userSub?.name,
      cellWidth: 150,
      selectAsync: selectAsyncUser(trocId),
    },
    {
      label: 'Caissier',
      key: 'acceptorSubId',
      type: 'selectAsync',
      getValue: (payment) => payment.acceptor?.name,
      cellWidth: 150,
      selectAsync: selectAsyncUser(trocId),
    },
    {
      label: 'Sens',
      // Champ calculé à partir du signe du montant, filtré par exact_direction
      key: 'direction' as FieldInteface<IPaymentLookup>['key'],
      type: 'select',
      getValue: getDirectionLabel,
      cellWidth: 90,
      options: [
        { value: null, label: 'Tous' },
        {
          value: 'in',
          label: 'Encaissé (client → troc)',
          icon: faDotCircle,
          iconStyle: 'color: rgb(76 175 80);',
        },
        {
          value: 'out',
          label: 'Versé (troc → client)',
          icon: faDotCircle,
          iconStyle: 'color: rgb(255 152 0);',
        },
      ],
    },
    {
      label: 'Montant',
      key: 'amount',
      type: 'currency',
      cellWidth: 90,
    },
    {
      label: 'Commentaire',
      key: 'message',
      cellWidth: 300,
    },
  ]
}
