import { SvelteComponentTyped } from 'svelte'

interface DataTableHeadProps {
  /** classes added to the table head */
  class?: string
}

declare class DataTableHead extends SvelteComponentTyped<DataTableHeadProps> {}

export default DataTableHead
