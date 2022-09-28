import { SvelteComponentTyped } from 'svelte'

export interface SubheaderProps {
  /** Classes to add to the subheader. */
  class?: string
  /** Styles to add to the subheader. */
  style?: string
  /** Whether to move the subheader to the right. */
  inset?: boolean
}

declare class Subheader extends SvelteComponentTyped<SubheaderProps> {}

export default Subheader
