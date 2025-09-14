import { browser } from "$app/environment";
import { derived, writable } from "svelte/store";

export let isDarkTheme = writable(
  browser && localStorage.getItem("isDarkTheme") === "true"
);
isDarkTheme.subscribe(
  (value) => browser && localStorage.setItem("isDarkTheme", String(value))
);

export let isMobile = writable(
  browser &&
    (navigator.userAgentData?.mobile || document.body.offsetWidth < 900)
);

export const layout = writable({
  headerHeight: 0,
  footerHeight: 0,
  mainHeight: 0,
  innerHeight: 0,
  isFooterDisplay: false,
});

export const isKeyboardOpen = derived(layout, ({ innerHeight }) => {
  return window.screen.height - innerHeight > 300;
});
