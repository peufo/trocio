import { SvelteComponentTyped } from 'svelte'
import { ItemGroupProps } from './ItemGroup'

interface ListItemGroupProps extends ItemGroupProps {}

declare class ListItemGroup extends SvelteComponentTyped<ListItemGroupProps> {}

export default ListItemGroup
