import { SvelteComponentTyped } from 'svelte'

interface DividerProps {
  /** inset moves divider 72px to the right */
  inset?: boolean
  /** vertical makes divider to a vertical divider */
  vertical?: boolean
  /** classes added to the divider */
  class?: string
  /** styles added to the divider */
  style?: string
}

declare class Divider extends SvelteComponentTyped<DividerProps> {}

export default Divider
