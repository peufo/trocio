import { SvelteComponentTyped } from 'svelte'

interface DataTableCellProps {
  /** classes added to the table cell */
  class?: string
  /** whether the cell contains numeric values */
  numeric?: boolean
}

declare class DataTableCell extends SvelteComponentTyped<DataTableCellProps> {}

export default DataTableCell
