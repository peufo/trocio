import { SvelteComponentTyped } from 'svelte'

export interface TabProps {
  class?: string
  value?: any
  activeClass?: string
  disabled?: boolean
}

declare class Tab extends SvelteComponentTyped<TabProps> {}

export default Tab
