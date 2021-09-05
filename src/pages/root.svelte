<script>
  import { onMount } from 'svelte'
  import { slide } from 'svelte/transition'
  import { Button, Table } from 'svelte-materialify'

  import { getHeader, syntaxHighlight } from '$lib/utils'
  import notify from '$lib/notify'
  // import SearchUser from '$lib/SearchUser.svelte'
  import UserSelect from '$lib/user/Select.svelte'

  let isRootUser = false

  onMount(() => {
    fetch('/api/root')
      .then((res) => res.json())
      .then((json) => {
        if (json.success) {
          isRootUser = true
          getOptions()
        }
      })
      .catch(console.trace)
  })

  let userSelected = {}
  let userSelectedPromise
  let addCreditPromise

  let options = []

  let searchTroc = ''
  let trocs = []

  async function selectUser(event) {
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
      let res = await fetch(
        `/api/root/addcredit`,
        getHeader({ user: userSelected._id })
      )
      let json = await res.json()
      if (json.error) return notify.error(json.message)
      userSelected.creditTroc++
      return notify.success(json.message)
    } catch (error) {
      console.trace(error)
    }
  }

  async function getOptions() {
    try {
      let res = await fetch('/api/root/options')
      let json = await res.json()
      options = json
    } catch (error) {
      console.trace(error)
    }
  }

  async function fetchTrocs() {
    try {
      let res = await fetch(`/api/root/trocs?${searchTroc}`)
      trocs = await res.json()
    } catch (error) {
      notify.error(error)
    }
  }

  async function subcribeAllUsers(troc) {
    if (confirm('Sur ?')) {
      try {
        let res = await fetch(
          '/api/root/subscribe-all-users',
          getHeader({ troc })
        )
        let json = await res.json()
        if (json.error) throw json.message
        notify.success(json.message)
      } catch (error) {
        notify.error(error)
      }
    }
  }

  async function removeTroc(troc) {
    if (prompt(`Tapez "${troc.name}" pour le supprimer`) === troc.name) {
      try {
        let res = await fetch('/api/root/remove-troc', getHeader({ troc }))
        let json = await res.json()
        if (json.error) throw json.message
        notify.success(json.message)
      } catch (error) {
        notify.error(error)
      }
    } else {
      notify.warning('Nom incorrect')
    }
  }

  async function computeSubscriber(troc) {
    try {
      let res = await fetch('/api/root/compute-subscriber', getHeader({ troc }))
      let json = await res.json()
      if (json.error) throw json.message
      notify.success(json.message)
    } catch (error) {
      notify.error(error)
    }
  }

  async function computeArticles(troc) {
    try {
      let res = await fetch('/api/root/compute-articles', getHeader({ troc }))
      let json = await res.json()
      if (json.error) throw json.message
      notify.success(json.message)
    } catch (error) {
      notify.error(error)
    }
  }
</script>

{#if !isRootUser}
  <h1 style="color: red;">Access denied</h1>
{:else}
  <div class="main">
    <div class="simple-card">
      <h6>Options globals</h6>

      <Table>
        <thead>
          <tr>
            <td>Name</td>
            <td>Value</td>
          </tr>
        </thead>
        <tbody>
          {#each options as option}
            <tr>
              <td>{option.name}</td>
              <td>{option.value}</td>
            </tr>
          {/each}
        </tbody>
      </Table>
    </div>

    <div class="simple-card">
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

    <div class="simple-card">
      <h6>Trocs</h6>
      <div class="w3-row">
        <input bind:value={searchTroc} on:input={fetchTrocs} class="w3-input" />
        <br />
        {#each trocs as troc}
          <div class="simple-card">
            <Button
              class="w3-margin-right"
              on:click={() => subcribeAllUsers(troc._id)}
            >
              Abonner tous les utilisateurs
            </Button>
            <Button
              class="w3-margin-right"
              on:click={() => computeSubscriber(troc._id)}
            >
              Compter le nombre d'abonnement
            </Button>
            <Button
              class="w3-margin-right"
              on:click={() => computeArticles(troc._id)}
            >
              Compter le nombre d'articles
            </Button>
            <Button class="w3-red" on:click={() => removeTroc(troc._id)}>
              Supprimer
            </Button>

            <h6 on:click={() => (troc.show = !troc.show)}>
              {troc.name}
            </h6>
            {#if troc.show}
              <pre
                transition:slide>
                {@html syntaxHighlight(JSON.stringify(troc, null, 2))}
              </pre>
            {/if}
          </div>
        {/each}
      </div>
    </div>
  </div>
{/if}

<style>
  .main {
    max-width: 800px;
    margin: auto;
    margin-top: 20px;
  }

  .simple-card {
    padding: 16px;
    margin-bottom: 20px;
  }
</style>
