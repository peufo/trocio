<script lang="ts">
  import notify from '$lib/notify'

  import { useInfinitApi } from '$lib/api'
  import MagicTable from '$lib/util/MagicTable.svelte'

  import type { DynamicQuery, User, FieldInteface } from 'types'

  let userSelected: User | null = null

  $: query = useInfinitApi<DynamicQuery<User>, User>(['/api/root/users', {}])

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
  /*
  const fields: FieldInteface<User>[] = [
    {
      label: 'Name',
      queryKey: 's'
    }
  ]
*/
</script>

<MagicTable {query} {fields}>
  <h6 slot="title">Users</h6>
</MagicTable>
