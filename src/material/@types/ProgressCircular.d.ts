import { SvelteComponentTyped } from 'svelte'

interface ProgressCircularProps {
  class?: string
  indeterminate?: boolean
  color?: string
  rotate?: number
  size?: number
  value?: number
  width?: number
  style?: string
}

declare class ProgressCircular extends SvelteComponentTyped<ProgressCircularProps> {}

export default ProgressCircular
