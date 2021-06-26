import { writable } from 'svelte/store'

export let isDarkTheme = writable(false)

export const layout = writable({
  headerHeight: 0,
  footerHeight: 0,
  mainHeight: 0,
  innerHeight: 0,
})

/** Contrôle de l'affichage de du volet de navigation */
export const trocNavigationActive = writable(true)

export default layout
