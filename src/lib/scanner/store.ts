import { readable } from 'svelte/store'
import { storeBoolean } from '$lib/utils'

export const isAutoScanOn = storeBoolean('isAutoScanOn')
export const isVibrateOn = storeBoolean('isVibrateOn')
export const isFlashOn = storeBoolean('isFlashOn')
export const isSoundOn = storeBoolean('isSoundOn')
