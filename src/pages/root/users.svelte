<script lang="ts">
  import notify from '$lib/notify'
  import { useInfinitApi } from '$lib/api'
  import MagicTable from '$lib/util/MagicTable.svelte'
  import { layout } from '$lib/store/layout'
  import type { DynamicQuery, User, FieldInteface } from 'types'

  let searchValue = ''
  $: query = useInfinitApi<DynamicQuery<User>, User>([
    'root/users',
    {
      or_search_name: searchValue,
      or_search_mail: searchValue,
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

  const fields: FieldInteface<User>[] = [
    {
      label: 'Name',
      queryKey: 'name',
    },
    {
      label: 'Mail',
      queryKey: 'mail',
    },
    {
      label: 'Mail validé',
      queryKey: 'mailvalided',
    },
    {
      label: 'Condition accepté',
      queryKey: 'acceptTerms',
      hidden: true,
    },
  ]
</script>

<div class="pa-4">
  <MagicTable
    {query}
    {fields}
    bind:searchValue
    wrapperStyle="max-height: {$layout.mainHeight - 76}px;"
  >
    <h6 slot="title">Users</h6>
  </MagicTable>
</div>
