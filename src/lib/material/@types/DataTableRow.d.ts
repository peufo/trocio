import { SvelteComponentTyped } from 'svelte'

interface DataTableRowProps {
  /** classes added to the table row */
  class?: string
}

declare class DataTableRow extends SvelteComponentTyped<DataTableRowProps> {}

export default DataTableRow
