import { SvelteComponentTyped } from 'svelte'
import { RippleOptions } from './Ripple'

interface ListItemProps {
  /** classes added to the listitem */
  class?: string
  /** classes added when active */
  activeClass?: string
  /** specify active state */
  active?: boolean
  /** value to use in ListItemGroup */
  value?: any
  /** makes the listitem dense */
  dense?: boolean
  /** disables the listitem */
  disabled?: boolean
  /** makes text selectable if true */
  selectable?: boolean
  /** there is no word wrap */
  multiline?: boolean
  /** options for the ripple action */
  ripple?: RippleOptions
  /** styles added to listitem */
  style?: string
  /** href link */
  href?: string
  /** target prop passed to link */
  tagret?: string
}

declare class ListItem extends SvelteComponentTyped<ListItemProps> {}

export default ListItem
