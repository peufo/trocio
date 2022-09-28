import { SvelteComponentTyped } from 'svelte'

interface DataTableBodyProps {
  /** classes added to the table body */
  class?: string
}

declare class DataTableBody extends SvelteComponentTyped<DataTableBodyProps> {}

export default DataTableBody
