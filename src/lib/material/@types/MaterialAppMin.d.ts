import { SvelteComponentTyped } from 'svelte'

interface MaterialAppMinProps {
  /** theme for the app */
  theme?: 'light' | 'dark'
}

declare class MaterialAppMin extends SvelteComponentTyped<MaterialAppMinProps> {}

export default MaterialAppMin
