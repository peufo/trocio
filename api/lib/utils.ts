export function renderAmount(
  amount?: number | string,
  currency?: string
): string {
  amount = +amount
  if (isNaN(amount)) return '-'

  return amount.toLocaleString(
    undefined,
    currency
      ? {
          style: 'currency',
          currency,
        }
      : {
          maximumFractionDigits: 2,
          minimumFractionDigits: 2,
        }
  )
}
