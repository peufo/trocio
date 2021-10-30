<script lang="ts">
  import { params } from '@roxi/routify'
  import { List, ListItem, Avatar } from 'svelte-materialify'
  import { faSpinner, faTimes } from '@fortawesome/free-solid-svg-icons'
  import { useMutation, useQueryClient } from '@sveltestack/svelte-query'

  import { api, useApi } from '$lib/api'
  import { troc } from '$lib/troc/store'
  import { user } from '$lib/user/store'
  import UserSelect from '$lib/user/Select.svelte'
  import IconLink from '$lib/util/IconLink.svelte'
  import ExpansionCard from '$lib/util/ExpansionCard.svelte'
  import Loader from '$lib/util/Loader.svelte'
  import Share from '$lib/troc/Share.svelte'
  import type { SubscribeLookup, ParamsAPI, TrocLookup, RoleEnum } from 'types'
  import { useInfinitApi } from '$lib/api'
  import SubscribeMenu from '$lib/user/SubscribeMenu.svelte'
  import PrefixDialog from '$lib/user/PrefixDialog.svelte'

  let selectedSubscribe: undefined | SubscribeLookup = undefined
  let prefixDialogActive = false
  let open = [false, false, false, false]
  const queryClient = useQueryClient()
  let subscribeMenu: SubscribeMenu

  /**
   * Getters
   */
  let searchSubscribes = ''
  let searchAdmins = ''
  let searchCashiers = ''
  let searchTraders = ''
  $: queryAdminsCount = useApi<ParamsAPI, number>([
    'subscribes/count',
    { trocId: $params.trocId, role: 'admin' },
  ])
  $: queryAdmins = useInfinitApi<ParamsAPI, SubscribeLookup>([
    'subscribes',
    { trocId: $params.trocId, q: searchAdmins, role: 'admin' },
  ])
  $: queryCashiersCount = useApi<ParamsAPI, number>([
    'subscribes/count',
    { trocId: $params.trocId, role: 'cashier' },
  ])
  $: queryCashiers = useInfinitApi<ParamsAPI, SubscribeLookup>([
    'subscribes',
    { trocId: $params.trocId, q: searchCashiers, role: 'cashier' },
  ])
  $: queryTradersCount = useApi<ParamsAPI, number>([
    'subscribes/count',
    { trocId: $params.trocId, role: 'trader' },
  ])
  $: queryTraders = useInfinitApi<ParamsAPI, SubscribeLookup>([
    'subscribes',
    { trocId: $params.trocId, q: searchTraders, role: 'trader' },
  ])
  $: querySubscribes = useInfinitApi<ParamsAPI, SubscribeLookup>([
    'subscribes',
    { trocId: $params.trocId, q: searchSubscribes },
  ])

  /**
   * Setters
   */

  interface TrocUserQuery {
    trocId: string
    userId: string
  }
  interface AssignRoleBody extends TrocUserQuery {
    role: RoleEnum
  }
  const assignRole = useMutation(
    (data: AssignRoleBody) =>
      api<AssignRoleBody, SubscribeLookup>('/api/subscribes/assign', {
        method: 'post',
        data,
        success: data.role === 'basic' ? 'Rôle retiré' : `Rôle attribué`,
      }),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('subscribes')
        queryClient.invalidateQueries('subscribes/count')
      },
    }
  )

  function handleClick(event: MouseEvent, subscribe: SubscribeLookup) {
    selectedSubscribe = subscribe
    subscribeMenu.open(event, subscribe)
  }

  function handleClickPrefix(subscribe: SubscribeLookup) {
    selectedSubscribe = subscribe
    prefixDialogActive = true
  }

  function handleOpenCard(index: number) {
    open = open.map((o, i) => i === index)
  }
</script>

<SubscribeMenu bind:this={subscribeMenu} />

<PrefixDialog
  bind:active={prefixDialogActive}
  subscribe={selectedSubscribe}
  disabledPrefixs={$queryTraders.data?.pages
    .flat()
    .map((t) => t.prefix || '') || []}
/>

<div style="max-width: 700px; margin: auto;">
  <h6 class="mb-5">Gestion des collaborateurs</h6>

  <!-- Administrateurs -->
  <ExpansionCard
    title="{$queryAdminsCount.data} Administrateur{($queryAdminsCount.data ||
      0) > 1
      ? 's'
      : ''}"
    class="mb-3"
    open={open[0]}
    on:open={() => handleOpenCard(0)}
    hasSearchInput
    bind:searchValueDebounced={searchAdmins}
    query={queryAdmins}
  >
    <List>
      {#each $queryAdmins.data?.pages.flat() || [] as subscribe}
        <div on:click={(event) => handleClick(event, subscribe)}>
          <ListItem>
            <span>{subscribe.user.name}</span>
            <span slot="subtitle">{subscribe.user.mail}</span>
            <div
              slot="append"
              class="remove-icon"
              on:click|stopPropagation={() => {
                if (!$assignRole.isLoading)
                  $assignRole.mutate({
                    trocId: $params.trocId,
                    userId: subscribe.user._id,
                    role: 'basic',
                  })
              }}
            >
              {#if subscribe.user._id != $troc.creator._id && subscribe.user._id != $user._id}
                <IconLink
                  icon={$assignRole.isLoading ? faSpinner : faTimes}
                  disabled={$assignRole.isLoading}
                  spin={$assignRole.isLoading}
                  opacity
                />
              {/if}
            </div>
          </ListItem>
        </div>
      {/each}
    </List>

    <div class="pa-4">
      {#if $assignRole.isLoading}
        <Loader title="Ajout en cours" />
      {:else}
        <UserSelect
          label="Nouvel administrateur"
          exepted={($queryAdmins.data?.pages.flat() || []).map(
            ({ userId }) => userId
          )}
          on:select={(event) => {
            $assignRole.mutate({
              trocId: $params.trocId,
              userId: event.detail._id,
              role: 'admin',
            })
          }}
        />
      {/if}
    </div>
  </ExpansionCard>

  <!-- Caissier -->
  <ExpansionCard
    title="{$queryCashiersCount.data} Caissier{$queryCashiersCount.data || 0 > 1
      ? 's'
      : ''}"
    open={open[1]}
    class="mb-3"
    on:open={() => handleOpenCard(1)}
    hasSearchInput
    bind:searchValueDebounced={searchCashiers}
    query={queryCashiers}
  >
    <List>
      {#each $queryCashiers.data?.pages.flat() || [] as subscribe}
        <div on:click={(event) => handleClick(event, subscribe)}>
          <ListItem>
            <span>{subscribe.user.name}</span>
            <span slot="subtitle">{subscribe.user.mail}</span>
            <div
              class="remove-icon"
              slot="append"
              on:click|stopPropagation={() => {
                if (!$assignRole.isLoading)
                  $assignRole.mutate({
                    trocId: $params.trocId,
                    userId: subscribe.user._id,
                    role: 'basic',
                  })
              }}
            >
              <IconLink
                icon={$assignRole.isLoading ? faSpinner : faTimes}
                disabled={$assignRole.isLoading}
                spin={$assignRole.isLoading}
                opacity
              />
            </div>
          </ListItem>
        </div>
      {/each}
    </List>

    <div class="pa-4">
      {#if $assignRole.isLoading}
        <Loader title="Ajout en cours" />
      {:else}
        <UserSelect
          label="Nouveau caissier"
          exepted={($queryCashiers.data?.pages.flat() || []).map(
            ({ userId }) => userId
          )}
          on:select={(event) => {
            $assignRole.mutate({
              trocId: $params.trocId,
              userId: event.detail._id,
              role: 'cashier',
            })
          }}
        />
      {/if}
    </div>
  </ExpansionCard>

  <!-- Commercant -->
  <ExpansionCard
    title="{$queryTradersCount.data} Commerçant{$queryTradersCount.data || 0 > 1
      ? 's'
      : ''}"
    open={open[2]}
    class="mb-3"
    on:open={() => handleOpenCard(2)}
    hasSearchInput
    bind:searchValue={searchTraders}
    query={queryTraders}
  >
    <List>
      {#each $queryTraders.data?.pages.flat() || [] as subscribe, index}
        <div on:click={(event) => handleClick(event, subscribe)}>
          <ListItem>
            <div
              slot="prepend"
              on:click|stopPropagation={() => handleClickPrefix(subscribe)}
            >
              <Avatar class="secondary-color">
                {subscribe.prefix}
              </Avatar>
            </div>

            {subscribe.user.name}

            <span slot="subtitle">{subscribe.user.mail}</span>

            <div
              class="remove-icon"
              slot="append"
              on:click|stopPropagation={() => {
                if (!$assignRole.isLoading)
                  $assignRole.mutate({
                    trocId: $params.trocId,
                    userId: subscribe.user._id,
                    role: 'basic',
                  })
              }}
            >
              <IconLink
                icon={$assignRole.isLoading ? faSpinner : faTimes}
                disabled={$assignRole.isLoading}
                spin={$assignRole.isLoading}
                opacity
              />
            </div>
          </ListItem>
        </div>
      {/each}
    </List>

    <div class="pa-4">
      {#if $assignRole.isLoading}
        <Loader title="Ajout en cours" />
      {:else}
        <UserSelect
          label="Nouveau commerçant"
          exepted={($queryTraders.data?.pages.flat() || []).map(
            ({ userId }) => userId
          )}
          on:select={(event) => {
            $assignRole.mutate({
              trocId: $params.trocId,
              userId: event.detail._id,
              role: 'trader',
            })
          }}
        />
      {/if}
    </div>
  </ExpansionCard>

  <!-- Participants -->
  <ExpansionCard
    title="{$troc.subscriber} Participant{$troc.subscriber > 1 ? 's' : ''}"
    open={open[3]}
    class="mb-3"
    on:open={() => handleOpenCard(3)}
    hasSearchInput
    bind:searchValueDebounced={searchSubscribes}
    query={querySubscribes}
  >
    <List>
      {#each $querySubscribes.data?.pages.flat() || [] as subscribe}
        <div on:click={(event) => handleClick(event, subscribe)}>
          <ListItem>
            {subscribe.user.name}
            <span slot="subtitle">{subscribe.user.mail}</span>
          </ListItem>
        </div>
      {/each}
    </List>
  </ExpansionCard>

  <div class="d-flex">
    <div class="flex-grow-1" />
    <Share troc={$troc} label="Inviter de nouveaux particiants" />
  </div>
</div>

<style>
  :global(.s-list-item:hover .remove-icon) {
    transform: translateX(0);
    transition-delay: 250ms;
  }

  .remove-icon {
    transform: translateX(50px);
    transition: transform 200ms;
  }
</style>
