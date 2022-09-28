import { SvelteComponentTyped } from 'svelte'

export interface TabContentProps {
  class?: string
  style?: string
}

declare class TabContent extends SvelteComponentTyped<TabContentProps> {}

export default TabContent
