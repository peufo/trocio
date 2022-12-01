<script lang="ts">
  import { useQueryClient } from '@sveltestack/svelte-query'

  import notify from '$lib/notify'
  import { useInfinitApi } from '$lib/api'
  import MagicTable from '$lib/util/MagicTable.svelte'
  import { layout } from '$lib/store/layout'
  import type { DynamicQuery, User, UserWithRootInfo } from 'types'
  import { fieldsUser } from '$lib/root/fieldsUser'
  import { List, ListItem } from '$material'

  let searchValue = ''
  let queryParams = {}
  $: query = useInfinitApi<DynamicQuery<User>, UserWithRootInfo>([
    'root/users',
    {
      or_search_name: searchValue,
      or_search_mail: searchValue,
      ...queryParams,
    },
  ])

  const queryClient = useQueryClient()

  async function addCredit(user: UserWithRootInfo) {
    try {
      const res = await fetch(`/api/root/addcredit`, {
        method: 'post',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ user: user?._id }),
      })
      const json = await res.json()
      if (json.error) return notify.error(json.message)
      queryClient.invalidateQueries('root/users')
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

    <div slot="menu" let:item let:menu>
      <List>
        <ListItem
          on:click={() => {
            addCredit(item)
            menu.close()
          }}
        >
          Ajouter un crédit
        </ListItem>
      </List>
    </div>
  </MagicTable>
</div>
