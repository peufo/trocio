import { SvelteComponentTyped } from 'svelte'

interface IconProps {
  /** classes added to the icon */
  class?: string
  /** size of the icon */
  size?: string | number
  /** degress by which to rotate the icon */
  rotate?: number
  /** makes the icon spin */
  spin?: boolean
  /** disables the icon */
  disabled?: boolean
  /** svg path for the icon */
  path?: string | string[]
  /** label for the icon */
  label?: any
  /** styles added to the icon */
  style?: string
  /** Icon viewPort */
  viewWidth?: number | string
  viewHeight?: number | string
}

declare class Icon extends SvelteComponentTyped<IconProps> {}

export default Icon
