<script lang="ts">
  import { params } from '@roxi/routify'
  import { List, ListItem, Avatar } from 'svelte-materialify'
  import { faSpinner, faTimes, faUser } from '@fortawesome/free-solid-svg-icons'
  import { useMutation, useQueryClient } from '@sveltestack/svelte-query'

  import { api, useApi } from '$lib/api'
  import { troc } from '$lib/troc/store'
  import { user } from '$lib/user/store'
  import IconLink from '$lib/util/IconLink.svelte'
  import ExpansionCard from '$lib/util/ExpansionCard.svelte'
  import Loader from '$lib/util/Loader.svelte'
  import Share from '$lib/troc/Share.svelte'
  import type {
    SubscribeLookup,
    RoleEnum,
    ParamsSubscribeAPI,
    ISubscribe,
  } from 'types'
  import { useInfinitApi } from '$lib/api'
  import SubscribeMenu from '$lib/user/SubscribeMenu.svelte'
  import PrefixDialog from '$lib/user/PrefixDialog.svelte'

  import MagicSelect from '$lib/util/MagicSelect.svelte'

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
  $: queryAdminsCount = useApi<ParamsSubscribeAPI, number>([
    'subscribes/count',
    { exact_trocId: $params.trocId, exact_role: 'admin' },
  ])
  $: queryAdmins = useInfinitApi<ParamsSubscribeAPI, SubscribeLookup>([
    'subscribes',
    { exact_trocId: $params.trocId, q: searchAdmins, exact_role: 'admin' },
  ])
  $: queryCashiersCount = useApi<ParamsSubscribeAPI, number>([
    'subscribes/count',
    { exact_trocId: $params.trocId, exact_role: 'cashier' },
  ])
  $: queryCashiers = useInfinitApi<ParamsSubscribeAPI, SubscribeLookup>([
    'subscribes',
    { exact_trocId: $params.trocId, q: searchCashiers, exact_role: 'cashier' },
  ])
  $: queryTradersCount = useApi<ParamsSubscribeAPI, number>([
    'subscribes/count',
    { exact_trocId: $params.trocId, exact_role: 'trader' },
  ])
  $: queryTraders = useInfinitApi<ParamsSubscribeAPI, SubscribeLookup>([
    'subscribes',
    { exact_trocId: $params.trocId, q: searchTraders, exact_role: 'trader' },
  ])
  $: querySubscribesCount = useApi<ParamsSubscribeAPI, number>([
    'subscribes/count',
    { exact_trocId: $params.trocId, exact_role: 'basic' },
  ])
  $: querySubscribes = useInfinitApi<ParamsSubscribeAPI, SubscribeLookup>([
    'subscribes',
    { exact_trocId: $params.trocId, q: searchSubscribes, exact_role: 'basic' },
  ])

  interface AssignRoleBody {
    subscribeId: string
    role: RoleEnum
  }
  interface CreateSubscribeBody {
    userId: string
    trocId: string
    role?: RoleEnum
  }

  function invalidateSubscribes() {
    queryClient.invalidateQueries('subscribes')
    queryClient.invalidateQueries('subscribes/count')
  }

  const assignRole = useMutation(
    (data: AssignRoleBody) =>
      api<AssignRoleBody, SubscribeLookup>('/api/subscribes/role', {
        method: 'post',
        data,
        success: data.role === 'basic' ? 'Rôle retiré' : `Rôle attribué`,
      }),
    {
      onSuccess: invalidateSubscribes,
    }
  )

  const createSubscribe = useMutation(
    (data: CreateSubscribeBody) =>
      api<CreateSubscribeBody, ISubscribe>('/api/subscribes', {
        method: 'post',
        data,
        success: 'Nouvelle participation créée',
      }),
    {
      onSuccess: invalidateSubscribes,
    }
  )

  function assignRoleHandler(role: RoleEnum) {
    return (event: any | string) => {
      if ($assignRole.isLoading) return
      if (typeof event === 'string') {
        $assignRole.mutate({
          subscribeId: event,
          role,
        })
      } else if (event.detail._id) {
        $assignRole.mutate({
          subscribeId: event?.detail?._id,
          role,
        })
      } else {
        $createSubscribe.mutate({
          trocId: $params.trocId,
          userId: event.detail.userId,
          role,
        })
      }
    }
  }

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

  const magicSelectProps = {
    path: '/subscribes',
    searchKey: 'q',
    queryParams: { exact_trocId: $troc._id },
    getValue: (sub: SubscribeLookup) => sub.user?.name || sub.name,
    getValue2: (sub: SubscribeLookup) => sub.user?.mail || '',
    getKey: (sub: SubscribeLookup) => sub._id || '',
    solo: true,
    icon: faUser,
  }

  const magicSelectPropsWithGlobalUser = {
    ...magicSelectProps,
    queryParams: { exact_trocId: $troc._id, includGlobalUser: true },
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
            <span>{subscribe.user?.name || subscribe.name}</span>
            <span slot="subtitle">{subscribe.user?.mail || ''}</span>
            <div
              slot="append"
              class="remove-icon"
              on:click|stopPropagation={() =>
                assignRoleHandler('basic')(subscribe._id)}
            >
              {#if subscribe.user?._id !== $troc.creator._id && subscribe.user?._id !== $user._id}
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
      {#if $assignRole.isLoading || $createSubscribe.isLoading}
        <Loader title="Ajout en cours" />
      {:else}
        <MagicSelect
          placeholder="Nouvel administrateur"
          on:select={assignRoleHandler('admin')}
          {...magicSelectProps}
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
            <span>{subscribe.user?.name || subscribe.name}</span>
            <span slot="subtitle">{subscribe.user?.mail || ''}</span>
            <div
              class="remove-icon"
              slot="append"
              on:click|stopPropagation={() =>
                assignRoleHandler('basic')(subscribe._id)}
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
      {#if $assignRole.isLoading || $createSubscribe.isLoading}
        <Loader title="Ajout en cours" />
      {:else}
        <MagicSelect
          placeholder="Nouveau caissier"
          on:select={assignRoleHandler('cashier')}
          {...magicSelectProps}
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

            {subscribe.user?.name || subscribe.name}

            <span slot="subtitle">{subscribe.user?.mail || ''}</span>

            <div
              class="remove-icon"
              slot="append"
              on:click|stopPropagation={() =>
                assignRoleHandler('basic')(subscribe._id)}
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
      {#if $assignRole.isLoading || $createSubscribe.isLoading}
        <Loader title="Ajout en cours" />
      {:else}
        <MagicSelect
          placeholder="Nouveau commerçant"
          on:select={assignRoleHandler('trader')}
          {...magicSelectProps}
        />
      {/if}
    </div>
  </ExpansionCard>

  <!-- Participants -->
  <ExpansionCard
    title="{$querySubscribesCount.data} Participant{$querySubscribesCount.data ||
    0 > 1
      ? 's'
      : ''}"
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
            {subscribe.user?.name || subscribe.name}
            <span slot="subtitle">{subscribe.user?.mail || ''}</span>
          </ListItem>
        </div>
      {/each}
    </List>

    <div class="pa-4">
      {#if $assignRole.isLoading || $createSubscribe.isLoading}
        <Loader title="Ajout en cours" />
      {:else}
        <MagicSelect
          placeholder="Inviter un nouveau particiant"
          on:select={assignRoleHandler('basic')}
          {...magicSelectPropsWithGlobalUser}
        />
      {/if}
    </div>
  </ExpansionCard>

  <div class="d-flex">
    <div class="flex-grow-1" />
    <Share troc={$troc} label="Partager le troc" />
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
