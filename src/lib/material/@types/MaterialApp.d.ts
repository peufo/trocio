import { SvelteComponentTyped } from 'svelte'

interface MaterialAppProps {
  /** theme for the app */
  theme?: 'light' | 'dark'
}

declare class MaterialApp extends SvelteComponentTyped<MaterialAppProps> {}

export default MaterialApp
