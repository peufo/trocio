<script lang="ts">
  import { onMount } from 'svelte'
  import { fade, slide } from 'svelte/transition'
  import { params, redirect } from '@roxi/routify'
  import { Button, Tabs, Tab } from '$material'
  import { useMutation } from '@sveltestack/svelte-query'
  import { Peer } from 'peerjs'
  import { v4 as uuidv4 } from 'uuid'
  import {
    faArrowRightArrowLeft,
    faArrowRightFromBracket,
    faArrowRightToBracket,
    faCartShopping,
    faUserAlt,
    faUserPlus,
  } from '@fortawesome/free-solid-svg-icons'

  import type { ISubscribe, SubscribeLookup, SubscribeResum } from 'types'
  import { api, useApi } from '$lib/api'
  import { troc } from '$lib/troc/store'
  import { layout, isMobile } from '$lib/store/layout'
  import MagicSelect from '$lib/util/MagicSelect.svelte'
  import IconLink from '$lib/util/IconLink.svelte'
  import Provide from '$lib/cash/Provide.svelte'
  import Recover from '$lib/cash/Recover.svelte'
  import Buy from '$lib/cash/Buy.svelte'
  import SubActivity from '$lib/sub/Activity.svelte'
  import SubActivityMobile from '$lib/sub/ActivityMobile.svelte'
  import { renderAmount } from '$lib/utils'
  import PaymentDialog from '$lib/cash/PaymentDialog.svelte'
  import notify from '$lib/notify'
  import PeerQR from '$lib/cash/PeerQR.svelte'

  let clientSelector: MagicSelect
  const subscribeKey = 'client_subscribe_id'
  const tabIndexKey = 'cash_register_tab_index'
  let paymentDialog: PaymentDialog
  let subscribe: SubscribeLookup | undefined = undefined
  let mainContainer: HTMLDivElement

  const peerToken = uuidv4()
  let peerConnections = 0

  $: TABS = [
    {
      ref: 'provide',
      label: 'Dépot',
      icon: faArrowRightToBracket,
      component: Provide,
    },
    {
      ref: 'recover',
      label: 'Retrait',
      icon: faArrowRightFromBracket,
      component: Recover,
    },
    { ref: 'buy', label: 'Achat', icon: faCartShopping, component: Buy },
    {
      ref: 'resum',
      label: 'Compte',
      icon: faArrowRightArrowLeft,
      component: $isMobile ? SubActivityMobile : SubActivity,
    },
  ]

  $: subscribeId = $params[subscribeKey]
  $: queryResum = useApi<{ subscribeId: string }, SubscribeResum>({
    enabled: !!subscribeId,
    queryKey: ['subscribes/resum', { subscribeId }],
  })
  $: subscribe = $queryResum.data
  $: balance = $queryResum.data?.resum.balance
  $: mainContainerHeight =
    $layout.innerHeight - mainContainer?.offsetTop - ($isMobile ? 6 : 16)

  onMount(() => {
    // Seléctione le participant depuis l'url
    if (subscribeId) {
      api<{ subscribeId: string }, { name: string }>('/api/users/name', {
        params: { subscribeId },
      }).then((user) => clientSelector.setValue(user.name))
    }

    const peer = new Peer(peerToken)
    peer.on('connection', (local) => {
      peerConnections++
      local.on('close', () => peerConnections--)
      local.on('error', () => peerConnections--)
      local.on('data', (data) => {
        console.log(`TODO: handle ${data}`)
      })
    })

    // Ecoute les racourcis claviers
    document.addEventListener('keyup', handleShortcut)
    return () => {
      document.removeEventListener('keyup', handleShortcut)
      peer.destroy()
    }
  })

  function handleShortcut(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      paymentDialog.close()
    }

    if (!event.ctrlKey) return
    switch (event.key) {
      case 'Backspace':
        clientSelector.focus()
        break
      case 'Enter':
        openPaymentDialog()
        break
    }
  }

  function handleSelectClient(event: { detail: ISubscribe }) {
    const sub = event.detail
    if (!sub._id) {
      /** Création du subscribe dans le cas ou le client n'est pas encore participant */
      $createSubscribe.mutate({
        trocId: $params.trocId,
        userId: sub.userId || '',
      })
    }
  }

  function handleChangeTab(event: { detail: number }) {
    const queryParams = $params
    queryParams[tabIndexKey] = event.detail
    $redirect('', queryParams)
  }

  interface CreateSubscribeBody {
    trocId: string
    userId?: string
    isGuest?: boolean
  }
  /** Inscris un client qui à pu être identifé */
  const createSubscribe = useMutation(
    (data: CreateSubscribeBody) =>
      api<CreateSubscribeBody, ISubscribe>('/api/subscribes', {
        method: 'post',
        data,
        success: 'Nouvelle participation créée',
      }),
    {
      onSuccess: redirectSubscribe,
    }
  )

  /** Créer un client invité */
  const createSubscribeGuest = useMutation(
    (data: CreateSubscribeBody) =>
      api<CreateSubscribeBody, ISubscribe>('/api/subscribes', {
        method: 'post',
        data: { ...data, isGuest: true },
        success: 'Nouveau participant invité',
      }),
    {
      onSuccess: (newSubscribe) => {
        redirectSubscribe(newSubscribe)
        clientSelector.setValue(newSubscribe.name)
      },
    }
  )

  function redirectSubscribe(newSubscribe: ISubscribe) {
    $redirect('', { ...$params, [subscribeKey]: newSubscribe._id })
  }

  function openPaymentDialog() {
    if (!subscribe || balance === undefined) return
    if (Math.abs(balance) < 0.001)
      return notify.info(
        `Le solde de ${subscribe.user?.name || subscribe.name} est nul`
      )
    let msg = 'Règlement du solde en faveur du '
    msg += balance > 0 ? 'client' : 'troc'
    paymentDialog.open(subscribe, msg, -balance)
  }
</script>

<PaymentDialog bind:this={paymentDialog} />

{#if $troc}
  <div
    class="main-container"
    bind:this={mainContainer}
    style="height: {mainContainerHeight}px;"
  >
    <div class="d-flex flex-wrap align-center pb-2" style="gap: 0.5em;">
      <div class:flex-grow-1={$isMobile}>
        <MagicSelect
          placeholder="Chercher un client"
          bind:this={clientSelector}
          path="/subscribes"
          searchKey="q"
          selectKey={subscribeKey}
          on:select={handleSelectClient}
          queryParams={{ trocId: $troc._id, includGlobalUser: true }}
          getValue={(sub) => sub.user?.name || sub.name}
          getValue2={(sub) => sub.user?.mail || ''}
          getKey={(sub) => sub._id}
          icon={faUserAlt}
          solo
          keepValue
          dense
          disableFetchNext
        />
      </div>

      <Button
        outlined
        disabled={$createSubscribeGuest.isLoading}
        class="primary-text"
        style="height: 40px;"
        on:click={() =>
          $createSubscribeGuest.mutate({ trocId: $params.trocId })}
      >
        <IconLink
          icon={faUserPlus}
          class={$isMobile ? '' : 'mr-2'}
          size={$isMobile ? '1.4em' : '1.2em'}
        />
        {$isMobile ? '' : 'Nouveau client'}
      </Button>

      {#if !$isMobile}
        <div class="flex-grow-1" />
      {/if}

      {#if subscribeId && balance && Math.abs(balance) > 0.01}
        <div transition:slide|local style={$isMobile ? 'width: 100%;' : ''}>
          <Button block class="secondary-color" on:click={openPaymentDialog}>
            Règler {renderAmount(-balance, $troc.currency)} en faveur du
            {balance > 0 ? 'client' : 'troc'}
          </Button>
        </div>
      {/if}
    </div>

    {#if subscribeId}
      <div
        in:fade|local
        class="simple-card flex-grow-1"
        style="
          min-height: 300px;
          overflow: hidden;
        "
      >
        <Tabs
          grow
          icons={$isMobile}
          value={$params[tabIndexKey] || 3}
          showArrows={false}
          on:change={handleChangeTab}
        >
          <div slot="tabs">
            {#each TABS as { label, icon }}
              <Tab class="rounded">
                {#if $isMobile || true}
                  <IconLink
                    {icon}
                    class={$isMobile ? '' : 'mr-3'}
                    size="1.2em"
                  />
                {/if}
                <span style={$isMobile ? 'font-size: 0.8em;' : ''}>
                  {label}
                </span>
              </Tab>
            {/each}
          </div>
        </Tabs>

        {#each TABS as { component }, index}
          {#if index == ($params[tabIndexKey] || 3)}
            <div
              in:fade|locale
              style="
                height: calc(100% - {$isMobile ? '56' : '48'}px);
                overflow-y: auto;
              "
            >
              <svelte:component this={component} {subscribeId} modeAdmin />
            </div>
          {/if}
        {/each}
      </div>
    {:else}
      <div in:fade|local class="centered flex-grow-1">
        <PeerQR
          {peerToken}
          {peerConnections}
          disabled={!$troc.tag.useScanner}
        />
      </div>
    {/if}
  </div>
{/if}

<style lang="scss">
  :global(.s-tabs) {
    border-radius: 5px;
  }

  :global(.simple-card .s-tabs-bar.icons) {
    height: 56px;
  }

  .main-container {
    max-width: 1100px;
    margin: auto;
    display: flex;
    flex-direction: column;
  }
</style>
