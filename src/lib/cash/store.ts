import { storeBoolean } from '$lib/utils'

export const isAutoPrint = storeBoolean('isAutoPrint', true)
export const isAutoPurchasesPayment = storeBoolean(
  'isAutoPurchasesPayment',
  false
)
