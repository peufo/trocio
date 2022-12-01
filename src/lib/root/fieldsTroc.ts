import type { TrocLookup } from 'types'
import type { FieldInteface } from 'types/magic'

export const fieldsTroc: FieldInteface<TrocLookup>[] = [
  {
    label: 'Nom',
    key: 'name',
  },
  {
    label: 'creator',
    key: 'creator',
    type: 'selectAsync',
    getValue: (item) => item.creator.name,
    selectAsync: {
      path: 'root/users',
      searchKey: 'or_search_name',
      getValue: (item) => item.name,
      getKey: (item) => item._id,
    },
  },
]
