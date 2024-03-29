/// <reference types="svelte" />
/// <reference types="vite/client" />
/// <reference types="../types" />

declare interface LayoutScoped {
  headerHeight: number
  footerHeight: number
  mainHeight: number
}

declare module 'plotly.js-dist' {
  export * from '@types/plotly.js'
}
