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
  import { faSpinner } from '@fortawesome/free-solid-svg-icons'

  import { troc, useAddAdmin, useRemoveAdmin } from '$lib/troc/store'
  import { user } from '$lib/user/store'
  import UserSelect from '$lib/user/Select.svelte'
  import IconLink from '$lib/util/IconLink.svelte'
  import ExpansionCard from '$lib/util/ExpansionCard.svelte'
  import Loader from '$lib/util/Loader.svelte'

  // import { troc } from './stores'
  // import { getHeader, updateTroc } from './utils'
  const addAdmin = useAddAdmin()
  const removeAdmin = useRemoveAdmin()

  let selectedTrader = -1
  let selectedTraderName = ''
  let selectedTraderPrefix = ''
  let traderDialogActive = false
  let changePrefixPromise

  let open = [false, false, false]

  let searchValueAdmin = ''
  let searchValueCashier = ''
  let searchValueTrader = ''

  $: filterAdmin = (user) =>
    !!user.name.match(new RegExp(searchValueAdmin, 'i'))

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

  function handleOpen(index) {
    open = open.map((o, i) => i === index)
  }
</script>

<!-- Administrateurs -->

<div class="pt-5" style="max-width: 800px; margin: auto;">
  <ExpansionCard
    title="Administrateurs"
    open={open[0]}
    on:open={() => handleOpen(0)}
    hasSearchInput
    bind:searchValue={searchValueAdmin}
  >
    <List>
      {#each $troc.admin.filter(filterAdmin) as admin}
        <ListItem selectable>
          <span>{admin.name}</span>
          <span slot="subtitle">{admin.mail}</span>
          <div
            slot="append"
            class="trash"
            on:click={() => {
              if (!$removeAdmin.isLoading)
                $removeAdmin.mutate({
                  trocId: $params.trocId,
                  userId: admin._id,
                })
            }}
          >
            {#if admin._id != $troc.creator._id && admin._id != $user._id}
              <IconLink
                icon={$removeAdmin.isLoading ? faSpinner : faTrashAlt}
                clickable={!$removeAdmin.isLoading}
                spin={$removeAdmin.isLoading}
                opacity
              />
            {/if}
          </div>
        </ListItem>
      {/each}
    </List>

    <div class="pa-4">
      {#if $addAdmin.isLoading}
        <Loader title="Ajout en cours" />
      {:else}
        <UserSelect
          label="Nouvel administrateur"
          exepted={$troc.admin.map(({ _id }) => _id)}
          on:select={(event) => {
            $addAdmin.mutate({
              trocId: $params.trocId,
              userId: event.detail._id,
            })
          }}
        />
      {/if}
    </div>
  </ExpansionCard>

  <br />

  <ExpansionCard
    title="Caissiers"
    hasSearchInput
    open={open[1]}
    on:open={() => handleOpen(1)}
    bind:searchValue={searchValueCashier}
  >
    <List>
      {#each $troc.cashier as cashier}
        <ListItem>
          <span>{cashier.name}</span>
          <span slot="subtitle">{cashier.mail}</span>
          <div
            class="trash"
            slot="append"
            on:click={() => removeCashier(cashier._id)}
          >
            <IconLink icon={faTrashAlt} />
          </div>
        </ListItem>
      {/each}
    </List>

    <CardActions>
      <UserSelect
        label="Nouveau caissier"
        exepted={$troc.cashier.map((user) => user._id)}
        on:select={addCashier}
      />
    </CardActions>
  </ExpansionCard>

  <br />

  <ExpansionCard
    title="Commerçants"
    hasSearchInput
    open={open[2]}
    on:open={() => handleOpen(2)}
    bind:searchValue={searchValueTrader}
  >
    <List twoLine style="width: 480px; min-width: 200px; margin: auto;">
      {#if $troc.trader}
        {#each $troc.trader as trader, i}
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
      exepted={$troc.trader.map((t) => t.user._id)}
      on:select={addTrader}
    />
  </ExpansionCard>
</div>

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
        $troc.trader.map((t) => t.prefix).indexOf(selectedTraderPrefix) != -1}
      class="w3-right w3-margin-top"
    >
      Valider
    </Button>
  {/await}
</Dialog>

<style>
  .trash {
    transform: translateX(50px);
    transition: transform 200ms;
  }

  :global(.s-list-item:hover .trash) {
    transform: translateX(0);
    transition-delay: 300ms;
  }
</style>
