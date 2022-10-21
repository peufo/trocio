import { writable, readable } from 'svelte/store'

const storeBool = (key: string) => {
  const store = writable(localStorage.getItem(key) === 'true')
  store.subscribe((value) => localStorage.setItem(key, String(value)))
  return store
}

export const isAutoScanOn = storeBool('isAutoScanOn')
export const isVibrateOn = storeBool('isVibrateOn')
export const isFlashOn = storeBool('isFlashOn')
export const isSoundOn = storeBool('isSoundOn')

export const connectionPrefix = readable('troc.io/yolo:')
