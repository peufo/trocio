import { writable } from 'svelte/store'

export let layout = writable({
  headerHeight: 0,
  footerHeight: 0,
  mainHeight: 0,
})

export default layout
