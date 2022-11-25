<script lang="ts">
  import { params } from '@roxi/routify'
  import { useMutation, useQueryClient } from '@sveltestack/svelte-query'
  import { faUserPlus } from '@fortawesome/free-solid-svg-icons'

  import { getFields } from '$lib/user/fields'
  import { api, useInfinitApi } from '$lib/api'
  import MagicTableWrapper from '$lib/util/MagicTableWrapper.svelte'
  import MagicTableFieldSelect from '$lib/util/MagicTableFieldSelect.svelte'
  import MagicTableHeaders from '$lib/util/MagicTableHeaders.svelte'
  import MagicTableBody from '$lib/util/MagicTableBody.svelte'
  import type {
    SubscribeLookup,
    ParamsSubscribeAPI,
    ISubscribe,
    RoleEnum,
  } from 'types'
  import layout, { isMobile } from '$lib/store/layout'
  import SearchTextField from '$lib/util/SearchTextField.svelte'
  import { troc } from '$lib/troc/store'
  import SubscribeMenu from '$lib/user/SubscribeMenu.svelte'
  import MagicSelect from '$lib/util/MagicSelect.svelte'

  let subscribeMenu: SubscribeMenu

  let searchValue = ''
  let queryParams = {}

  let fields = getFields($troc)
  const queryClient = useQueryClient()

  $: query = useInfinitApi<ParamsSubscribeAPI, SubscribeLookup[]>([
    'subscribes',
    {
      exact_trocId: $params.trocId,
      q: searchValue,
      includResum: true,
      ...queryParams,
    },
  ])

  interface CreateSubscribeBody {
    userId: string
    trocId: string
    role?: RoleEnum
  }

  const createSubscribe = useMutation(
    (data: CreateSubscribeBody) =>
      api<CreateSubscribeBody, ISubscribe>('/api/subscribes', {
        method: 'post',
        data,
        success: 'Nouvelle participation créée',
      }),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('subscribes')
      },
    }
  )

  function handleSelectNewSub(event: any) {
    const { userId } = event.detail
    if (!userId) return

    $createSubscribe.mutate({
      trocId: $troc._id,
      userId: event.detail.userId,
      role: 'basic',
    })
  }

  const getValue = (sub: SubscribeLookup) => sub.user?.name || sub.name
  const getValue2 = (sub: SubscribeLookup) => sub.user?.mail || ''
  const getKey = (sub: SubscribeLookup) => sub._id || ''

  let magicSelectIsFocus = false
</script>

<SubscribeMenu bind:this={subscribeMenu} />

<div class="container">
  <div class="d-flex align-center mb-2" style="gap: 1em;">
    <h6>{$isMobile ? 'Participants' : 'Gestion des participants'}</h6>
    <div class="flex-shrink-0">
      <MagicSelect
        placeholder="Inviter un participant"
        on:select={handleSelectNewSub}
        path="/subscribes"
        queryParams={{ exact_trocId: $troc._id, includGlobalUser: true }}
        searchKey="q"
        {getValue}
        {getValue2}
        {getKey}
        solo
        dense
        icon={faUserPlus}
        reduceMode={$isMobile}
        on:focus={() => (magicSelectIsFocus = true)}
        on:blur={() => (magicSelectIsFocus = false)}
      />
    </div>

    <div class="flex-grow-1" />
    {#if !$isMobile || !magicSelectIsFocus}
      <MagicTableFieldSelect bind:fields />
    {/if}
  </div>

  <MagicTableWrapper
    {query}
    class="simple-card"
    style="
      min-height: 400px;
      max-height: {$layout.mainHeight - ($troc.is_try ? 124 : 76)}px;
    "
  >
    <thead>
      <tr>
        <th colspan="2" style="padding-left: 0px;">
          <SearchTextField bind:search={searchValue} flat solo dense />
        </th>

        <MagicTableHeaders {fields} bind:queryParams searchColSpan={2} />
      </tr>
    </thead>

    <MagicTableBody
      {fields}
      {query}
      currency={$troc.currency}
      on:click={({ detail }) =>
        subscribeMenu.open(detail.clickEvent, detail.item)}
    />
  </MagicTableWrapper>
</div>
