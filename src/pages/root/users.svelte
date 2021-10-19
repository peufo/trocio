<script lang="ts">
  import notify from '$lib/notify'

  import UserSelect from '$lib/user/Select.svelte'
  import { getHeader, syntaxHighlight } from '$lib/utils'
  import { Button } from 'svelte-materialify'
  import type { User } from 'types'

  let userSelected: User | null = null
  let userSelectedPromise: Promise<void>
  let addCreditPromise: Promise<string | void>

  async function selectUser(event: any) {
    try {
      let res = await fetch(`/api/root/users?_id=${event.detail._id}`)
      let json = await res.json()
      userSelected = json[0]
      return
    } catch (error) {
      console.trace(error)
    }
  }

  async function addCredit() {
    try {
      if (!userSelected) return
      let res = await fetch(
        `/api/root/addcredit`,
        getHeader({ user: userSelected?._id })
      )
      let json = await res.json()
      if (json.error) return notify.error(json.message)
      userSelected.creditTroc++
      return notify.success(json.message)
    } catch (error) {
      console.trace(error)
    }
  }
</script>

<div class="mt-8" style="width: 800px; margin: auto;">
  <h6>Utilisateurs</h6>
  <div class="w3-row">
    <div class="w3-col s6">
      <UserSelect
        modeSelect
        on:select={(e) => (userSelectedPromise = selectUser(e))}
      />

      {#await userSelectedPromise}
        Chargement des détails
      {:then}
        <pre>
              {@html syntaxHighlight(JSON.stringify(userSelected, null, 2))}
            </pre>
      {/await}
    </div>
    <div class="w3-col s6">
      {#await addCreditPromise}
        en cours...
      {:then}
        <Button
          on:click={() => (addCreditPromise = addCredit())}
          class="w3-right"
        >
          +1 crédit
        </Button>
      {/await}
    </div>
  </div>
</div>
