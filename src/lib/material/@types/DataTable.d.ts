import { SvelteComponentTyped } from 'svelte'

interface DataTableProps {
  /** classes added to the table */
  class?: string
}

declare class DataTable extends SvelteComponentTyped<DataTableProps> {}

export default DataTable
