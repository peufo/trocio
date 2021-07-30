<script lang="ts">
  import { params } from '@roxi/routify'
  import {
    List,
    ListItem,
    Dialog,
    Button,
    Avatar,
    Card,
    CardTitle,
    CardText,
    CardActions,
  } from 'svelte-materialify'
  import { faTrashAlt } from '@fortawesome/free-regular-svg-icons'
  import { faSpinner } from '@fortawesome/free-solid-svg-icons'

  import {
    troc,
    subscribes,
    useAddAdmin,
    useRemoveAdmin,
    useAddCashier,
    useRemoveCashier,
    useAddTrader,
    useRemoveTrader,
    useSetTraderPrefix,
  } from '$lib/troc/store'
  import { user } from '$lib/user/store'
  import UserSelect from '$lib/user/Select.svelte'
  import IconLink from '$lib/util/IconLink.svelte'
  import ExpansionCard from '$lib/util/ExpansionCard.svelte'
  import Loader from '$lib/util/Loader.svelte'
  import Share from '$lib/troc/Share.svelte'

  // import { troc } from './stores'
  // import { getHeader, updateTroc } from './utils'
  const addAdmin = useAddAdmin()
  const removeAdmin = useRemoveAdmin()
  const addCashier = useAddCashier()
  const removeCashier = useRemoveCashier()
  const addTrader = useAddTrader()
  const removeTrader = useRemoveTrader()
  const setTraderPrefix = useSetTraderPrefix()
  let selectedTrader = null
  let traderDialogActive = false
  let selectedPrefix = ''

  let open = [false, false, false, false]

  let searchValueAdmin = ''
  let searchValueCashier = ''
  let searchValueTrader = ''
  let searchValueSubscriber = ''

  $: filterAdmin = (user) =>
    !!user.name.match(new RegExp(searchValueAdmin, 'i'))
  $: filterCashier = (user) =>
    !!user.name.match(new RegExp(searchValueCashier, 'i'))
  $: filterTrader = (trader) =>
    !!trader.user.name.match(new RegExp(searchValueTrader, 'i')) ||
    trader.prefix === searchValueTrader.toUpperCase()

  const prefixs = []
  for (let index = 65; index < 91; index++) {
    prefixs.push(String.fromCharCode(index))
  }

  function handleClickTrader(index) {
    selectedTrader = $troc.trader[index]
    selectedPrefix = selectedTrader.prefix
    traderDialogActive = true
  }

  function handleOpen(index) {
    open = open.map((o, i) => i === index)
  }
</script>

<!-- Administrateurs -->

<div class="pt-5" style="max-width: 700px; margin: auto;">
  <ExpansionCard
    title="{$troc.admin.length} Administrateur{$troc.admin.length > 1
      ? 's'
      : ''}"
    class="mb-3"
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
                disabled={$removeAdmin.isLoading}
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

  <ExpansionCard
    title="{$troc.cashier.length} Caissier{$troc.cashier.length > 1 ? 's' : ''}"
    open={open[1]}
    class="mb-3"
    on:open={() => handleOpen(1)}
    hasSearchInput
    bind:searchValue={searchValueCashier}
  >
    <List>
      {#each $troc.cashier.filter(filterCashier) as cashier}
        <ListItem slecteable>
          <span>{cashier.name}</span>
          <span slot="subtitle">{cashier.mail}</span>
          <div
            class="trash"
            slot="append"
            on:click={() => {
              if (!$removeCashier.isLoading)
                $removeCashier.mutate({
                  trocId: $params.trocId,
                  userId: cashier._id,
                })
            }}
          >
            <IconLink
              icon={$removeCashier.isLoading ? faSpinner : faTrashAlt}
              disabled={$removeCashier.isLoading}
              spin={$removeCashier.isLoading}
              opacity
            />
          </div>
        </ListItem>
      {/each}
    </List>

    <div class="pa-4">
      {#if $addCashier.isLoading}
        <Loader title="Ajout en cours" />
      {:else}
        <UserSelect
          label="Nouveau caissier"
          exepted={$troc.cashier.map(({ _id }) => _id)}
          on:select={(event) => {
            $addCashier.mutate({
              trocId: $params.trocId,
              userId: event.detail._id,
            })
          }}
        />
      {/if}
    </div>
  </ExpansionCard>

  <ExpansionCard
    title="{$troc.trader.length} Commerçant{$troc.trader.length > 1 ? 's' : ''}"
    open={open[2]}
    class="mb-3"
    on:open={() => handleOpen(2)}
    hasSearchInput
    bind:searchValue={searchValueTrader}
  >
    <List>
      {#each $troc.trader.filter(filterTrader) as trader, index}
        <ListItem on:click={(e) => handleClickTrader(index)}>
          <div slot="prepend">
            <Avatar class="secondary-color">
              {trader.prefix}
            </Avatar>
          </div>

          {trader.user.name}

          <span slot="subtitle">{trader.user.mail}</span>

          <div
            class="trash"
            slot="append"
            on:click|stopPropagation={() => {
              if (!$removeTrader.isLoading)
                $removeTrader.mutate({
                  trocId: $params.trocId,
                  userId: trader.user._id,
                })
            }}
          >
            <IconLink
              icon={$removeTrader.isLoading ? faSpinner : faTrashAlt}
              disabled={$removeTrader.isLoading}
              spin={$removeTrader.isLoading}
              opacity
            />
          </div>
        </ListItem>
      {/each}
    </List>

    <div class="pa-4">
      {#if $addTrader.isLoading}
        <Loader title="Ajout en cours" />
      {:else}
        <UserSelect
          label="Nouveau commerçant"
          exepted={$troc.trader.map(({ user }) => user._id)}
          on:select={(event) => {
            $addTrader.mutate({
              trocId: $params.trocId,
              userId: event.detail._id,
            })
          }}
        />
      {/if}
    </div>
  </ExpansionCard>

  <ExpansionCard
    title="{$troc.subscriber} Participant{$troc.subscriber > 1 ? 's' : ''}"
    open={open[3]}
    class="mb-3"
    on:open={() => handleOpen(3)}
    hasSearchInput
    bind:searchValue={searchValueSubscriber}
  >
    <List>
      {#each $subscribes as subscribe}
        <ListItem>
          {subscribe.user.name}

          <span slot="subtitle">{subscribe.user.mail}</span>
        </ListItem>
      {/each}
    </List>
  </ExpansionCard>

  <div class="d-flex">
    <div class="flex-grow-1" />
    <Share troc={$troc} label="Inviter de nouveaux particiants" />
  </div>
</div>

<Dialog bind:active={traderDialogActive}>
  <Card>
    <CardTitle>
      <h6>Choix du prefix de {selectedTrader.user.name}</h6>
    </CardTitle>

    <CardText>
      {#each prefixs as prefix}
        <div
          class="prefix"
          class:selected={selectedPrefix === prefix}
          class:secondary-color={selectedPrefix === prefix}
          class:disabled={$troc.trader.map((t) => t.prefix).includes(prefix) &&
            selectedTrader.prefix !== prefix}
          on:click={() => {
            if (
              !$troc.trader.map((t) => t.prefix).includes(prefix) ||
              selectedTrader.prefix === prefix
            )
              selectedPrefix = prefix
          }}
        >
          {prefix}
        </div>
      {/each}
    </CardText>

    <CardActions class="justify-end">
      {#if $setTraderPrefix.isLoading}
        <Button text disabled>
          <Loader title="Validation" />
        </Button>
      {:else}
        <Button
          text
          on:click={() => {
            $setTraderPrefix.mutate(
              {
                trocId: $params.trocId,
                userId: selectedTrader.user._id,
                prefix: selectedPrefix,
              },
              {
                onSuccess: () => {
                  traderDialogActive = false
                },
              }
            )
          }}
          disabled={$troc.trader.map((t) => t.prefix).includes(selectedPrefix)}
        >
          Valider
        </Button>
      {/if}
    </CardActions>
  </Card>
</Dialog>

<style>
  :global(.s-list-item:hover .trash) {
    transform: translateX(0);
    transition-delay: 250ms;
  }
  .trash {
    transform: translateX(50px);
    transition: transform 200ms;
  }

  .prefix {
    height: 48px;
    width: 48px;
    border-radius: 50%;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    position: relative;
  }

  .prefix.selected {
    color: #fff;
  }

  .prefix:not(.disabled):hover {
    background-color: var(--theme-tables-hover);
  }

  .prefix.disabled {
    color: var(--theme-text-disabled);
    cursor: default;
  }

  .prefix.disabled::after {
    content: '';
    position: absolute;
    width: 50%;
    border-top: 2px var(--theme-text-secondary) solid;
    border-bottom: 1px var(--theme-surface) solid;
    transform-origin: 50% 0;
    transform: rotate(45deg);
  }
</style>
