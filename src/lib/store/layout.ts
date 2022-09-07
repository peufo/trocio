import { derived, writable } from 'svelte/store'

export let isDarkTheme = writable(
  localStorage.getItem('isDarkTheme') === 'true'
)
isDarkTheme.subscribe((value) =>
  localStorage.setItem('isDarkTheme', String(value))
)

export let isMobile = writable(
  navigator.userAgentData?.mobile || document.body.offsetWidth < 900
)

export const layout = writable({
  headerHeight: 0,
  footerHeight: 0,
  mainHeight: 0,
  innerHeight: 0,
})

export const isKeyboardOpen = derived(layout, ({ innerHeight }) => {
  return window.screen.height - innerHeight > 300
})

export default layout
