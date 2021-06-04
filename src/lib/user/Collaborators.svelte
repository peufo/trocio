<script lang="ts">
  import { params } from '@roxi/routify'
  import {
    List,
    ListItem,
    Dialog,
    TextField,
    Button,
    CardActions,
  } from 'svelte-materialify'
  import { faTrashAlt } from '@fortawesome/free-regular-svg-icons'

  import Loader from '$lib/util/Loader.svelte'
  import IconLink from '$lib/util/IconLink.svelte'
  import ExpansionCard from '$lib/util/ExpansionCard.svelte'

  import { user } from '$lib/user/store'
  import { useTroc, useTrocOptions } from '$lib/troc/store'

  const trocQuery = useTroc($params.trocId)
  $: $params.trocId && trocQuery.setOptions(useTrocOptions($params.trocId))
  $: troc = $trocQuery.data

  // import { troc } from './stores'
  // import { user } from './stores'
  // import { getHeader, updateTroc } from './utils'

  import UserSelect from '$lib/user/Select.svelte'
  import { faPlus } from '@fortawesome/free-solid-svg-icons'

  let newCollaboratorDialogActive = false

  let selectedTrader = -1
  let selectedTraderName = ''
  let selectedTraderPrefix = ''
  let traderDialogActive = false
  let changePrefixPromise

  function findNewPrefix() {
    let prefixs = troc.trader.map((t) => t.prefix)
    let char = ''
    for (let i = 65; i < 91; i++) {
      char = String.fromCharCode(i)
      if (prefixs.indexOf(char) == -1) break
    }
    return char
  }

  function normalizePrefix() {
    selectedTraderPrefix = selectedTraderPrefix
      .slice(selectedTraderPrefix.length - 1, selectedTraderPrefix.length)
      .toLocaleUpperCase()
    if (
      selectedTraderPrefix.charCodeAt(0) < 65 ||
      selectedTraderPrefix.charCodeAt(0) > 90
    ) {
      selectedTraderPrefix = findNewPrefix()
    }
  }

  function clickTrader(e, index) {
    if (e.target.classList.contains('remove-icon')) {
      removeTrader(troc.trader[index].user._id)
    } else {
      selectedTrader = index
      selectedTraderName = troc.trader[index].user.name
      selectedTraderPrefix = troc.trader[index].prefix
      traderDialogActive = true
    }
  }

  async function changePrefix() {
    try {
      let res = await fetch(
        `/api/trocs/${troc._id}/trader/prefix`,
        getHeader({
          trader: troc.trader[selectedTrader].user._id,
          prefix: selectedTraderPrefix,
        })
      )
      let json = await res.json()
      if (json.success) {
        troc.trader[selectedTrader].prefix = selectedTraderPrefix
      } else alert(json.message)
      setTimeout(() => (traderDialogActive = false), 0)
      return
    } catch (error) {
      console.trace(error)
    }
  }

  function addAdmin(e) {
    fetch(`/api/trocs/${troc._id}/admin`, getHeader({ admin: e.detail._id }))
      .then((res) => res.json())
      .then(updateTroc)
      .catch(console.trace)
  }

  function addCashier(e) {
    fetch(
      `/api/trocs/${troc._id}/cashier`,
      getHeader({ cashier: e.detail._id })
    )
      .then((res) => res.json())
      .then(updateTroc)
      .catch(console.trace)
  }

  function addTrader(e) {
    fetch(
      `/api/trocs/${troc._id}/trader`,
      getHeader({ trader: e.detail._id, prefix: findNewPrefix() })
    )
      .then((res) => res.json())
      .then(updateTroc)
      .catch(console.trace)
  }

  function removeAdmin(userId) {
    fetch(`/api/trocs/${troc._id}/admin/remove`, getHeader({ admin: userId }))
      .then((res) => res.json())
      .then(updateTroc)
      .catch(console.trace)
  }

  function removeCashier(userId) {
    fetch(
      `/api/trocs/${troc._id}/cashier/remove`,
      getHeader({ cashier: userId })
    )
      .then((res) => res.json())
      .then(updateTroc)
      .catch(console.trace)
  }

  function removeTrader(userId) {
    fetch(`/api/trocs/${troc._id}/trader/remove`, getHeader({ trader: userId }))
      .then((res) => res.json())
      .then(updateTroc)
      .catch(console.trace)
  }
</script>

<!-- Administrateurs -->
{#if $trocQuery.isLoading}
  <div class="centered" style="height: 100px;">
    <Loader />
  </div>
{:else if $trocQuery.isError}
  <div class="centered" style="height: 100px;">
    <span>Oups, une erreur c'est produite.</span>
  </div>
{:else}
  <div class="pt-5" style="max-width: 800px; margin: auto;">
    <ExpansionCard title="Administrateurs" open={true} hasSearchInput>
      <List>
        {#each troc.admin as admin}
          <ListItem>
            <span>{admin.name}</span>
            <span slot="subtitle">{admin.mail}</span>

            <div slot="append" on:click={() => removeCashier(admin._id)}>
              {#if admin._id != troc.creator._id && admin._id != $user._id}
                <IconLink icon={faTrashAlt} />
              {/if}
            </div>
          </ListItem>
        {/each}
      </List>
      <CardActions>
        <UserSelect
          label="Nouvel administrateur"
          exepted={troc.admin.map(({ _id }) => _id)}
          on:select={console.log}
        />
      </CardActions>
    </ExpansionCard>

    <br />

    <ExpansionCard title="Caissiers" hasSearchInput>
      <List>
        {#each troc.cashier as cashier}
          <ListItem>
            <span>{cashier.name}</span>
            <span slot="subtitle">{cashier.mail}</span>
            <div slot="append" on:click={() => removeCashier(cashier._id)}>
              <IconLink icon={faTrashAlt} />
            </div>
          </ListItem>
        {/each}
      </List>

      <CardActions>
        <UserSelect
          id="Newcashier"
          label="Nouveau caissier"
          exepted={troc.cashier}
          on:select={addCashier}
        />
      </CardActions>
    </ExpansionCard>

    <br />

    <ExpansionCard title="Commerçants" hasSearchInput>
      <List twoLine style="width: 480px; min-width: 200px; margin: auto;">
        {#if troc.trader}
          {#each troc.trader as trader, i}
            <ListItem on:click={(e) => clickTrader(e, i)}>
              <span>
                <b>{trader.prefix}</b>&nbsp;
                <i class="fas fa-arrow-right w3-opacity" />&nbsp;
                {trader.user.name}
              </span>
              <span slot="subtitle">{trader.user.mail}</span>
              <div slot="append">
                <IconLink icon={faTrashAlt} />
              </div>
            </ListItem>
          {/each}
        {/if}
      </List>

      <UserSelect
        id="NewTrader"
        label="Nouveau commerçant"
        exepted={troc.trader.map((t) => t.user)}
        on:select={addTrader}
      />
    </ExpansionCard>
  </div>
{/if}

<Dialog bind:active={newCollaboratorDialogActive}>
  <h6>Nouveau collab</h6>
</Dialog>

<Dialog bind:active={traderDialogActive}>
  <h4>Edition du préfixe utilisé par {selectedTraderName}</h4>

  <TextField
    bind:value={selectedTraderPrefix}
    on:input={normalizePrefix}
    class="shaped-outlined w3-margin-top"
    label="Nouveau préfixe"
    variant="outlined"
    style="width: 100%;"
  />

  {#await changePrefixPromise}
    <Button variant="raised" color="secondary" class="w3-right w3-margin-top">
      <i class="fas fa-circle-notch w3-spin" />&nbsp;Validation...
    </Button>
  {:then}
    <Button
      on:click={() => (changePrefixPromise = changePrefix())}
      variant="raised"
      style="color: white;"
      disabled={!selectedTraderPrefix ||
        troc.trader.map((t) => t.prefix).indexOf(selectedTraderPrefix) != -1}
      class="w3-right w3-margin-top"
    >
      Valider
    </Button>
  {/await}
</Dialog>
