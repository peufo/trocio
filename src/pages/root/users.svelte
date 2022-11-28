<script lang="ts">
  import notify from '$lib/notify'
  import { useInfinitApi } from '$lib/api'
  import MagicTable from '$lib/util/MagicTable.svelte'
  import { layout } from '$lib/store/layout'
  import type { DynamicQuery, User } from 'types'
  import type { FieldInteface } from 'types/magic'

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

  const fields: FieldInteface<User>[] = [
    {
      label: 'Name',
      key: 'name',
    },
    {
      label: 'Mail',
      key: 'mail',
    },
    {
      label: 'Crédit',
      key: 'creditTroc',
      type: 'number',
    },
    {
      label: 'Mail validé',
      key: 'mailvalided',
      type: 'boolean',
    },
    {
      label: 'Condition accepté',
      key: 'acceptTerms',
      type: 'boolean',
    },
    {
      label: 'Tentative de connection',
      key: 'loginAttempts',
      type: 'number',
    },
  ]
</script>

<div class="pa-4">
  <MagicTable
    {query}
    {fields}
    bind:queryParams
    bind:searchValue
    wrapperStyle="max-height: {$layout.mainHeight - 76}px;"
  >
    <h6 slot="title">Users</h6>
  </MagicTable>
</div>
