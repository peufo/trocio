<script lang="ts">
  import notify from '$lib/notify'
  import { useInfinitApi } from '$lib/api'
  import MagicTable from '$lib/util/MagicTable.svelte'
  import { layout } from '$lib/store/layout'
  import type { DynamicQuery, User } from 'types'
  import { fieldsUser } from '$lib/root/fieldsUser'

  let searchValue = ''
  let queryParams = {}
  $: query = useInfinitApi<DynamicQuery<User>, User>([
    'root/users',
    {
      or_search_name: searchValue,
      or_search_mail: searchValue,
      ...queryParams,
    },
  ])

  let userSelected: User | null = null
  async function addCredit() {
    try {
      if (!userSelected) return
      let res = await fetch(`/api/root/addcredit`, {
        method: 'post',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ user: userSelected?._id }),
      })
      let json = await res.json()
      if (json.error) return notify.error(json.message)
      userSelected.creditTroc++
      return notify.success(json.message)
    } catch (error) {
      console.trace(error)
    }
  }
</script>

<div class="pa-4">
  <MagicTable
    {query}
    fields={fieldsUser}
    bind:queryParams
    bind:searchValue
    wrapperStyle="max-height: {$layout.mainHeight - 76}px;"
  >
    <h6 slot="title">Users</h6>
  </MagicTable>
</div>
