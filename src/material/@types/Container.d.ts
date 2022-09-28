import { SvelteComponentTyped } from 'svelte'

interface ContainerProps {
  /** classes added to the container */
  class?: string
  /** styles added to the container */
  style?: string
  /** fluid extends the container across all viewports and device sizes*/
  fluid?: boolean
}

declare class Container extends SvelteComponentTyped<ContainerProps> {}

export default Container
