<script lang="ts">
  import notify from '$lib/notify'

  import MagicSelect from '$lib/util/MagicSelect.svelte'
  import { getHeader, syntaxHighlight } from '$lib/utils'
  import { faUser } from '@fortawesome/free-solid-svg-icons'
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

<div class="pt-8" style="width: 800px; margin: auto;">
  <h6>Utilisateurs</h6>
  <div class="d-flex">
    <div>
      <MagicSelect
        modeSelect
        on:select={(e) => (userSelectedPromise = selectUser(e))}
        path="/root/users"
        queryParams={{ limit: 100 }}
        searchKey="q"
        solo
        icon={faUser}
      />

      {#await userSelectedPromise}
        Chargement des détails
      {:then}
        <pre>
              {@html syntaxHighlight(JSON.stringify(userSelected, null, 2))}
            </pre>
      {/await}
    </div>
    <div>
      {#await addCreditPromise}
        en cours...
      {:then}
        <Button on:click={() => (addCreditPromise = addCredit())}>
          +1 crédit
        </Button>
      {/await}
    </div>
  </div>
</div>
