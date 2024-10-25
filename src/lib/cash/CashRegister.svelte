<script lang="ts">
  import { onMount } from 'svelte'
  import { fade, slide } from 'svelte/transition'
  import { params, redirect, afterPageLoad } from '@roxi/routify'
  import { Button, Tabs, Tab } from '$material'
  import { useMutation } from '@sveltestack/svelte-query'
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
  import GuestDialog from '$lib/cash/GuestDialog.svelte'
  import notify from '$lib/notify'
  import CashPlaceholder from '$lib/cash/CashPlaceholder.svelte'
  import { subscribe as subscribeSSE } from '$lib/sse'

  let clientSelector: MagicSelect
  const subscribeKey = 'client_subscribe_id'
  const tabIndexKey = 'cash_register_tab_index'
  let paymentDialog: PaymentDialog
  let guestDialog: GuestDialog
  let subscribe: SubscribeLookup | undefined = undefined
  let mainContainer: HTMLDivElement

  let templateComponent: Provide | Recover | Buy | undefined
  let cashPlaceholder: CashPlaceholder

  $: TABS = [
    { label: 'Dépot', icon: faArrowRightToBracket },
    { label: 'Retrait', icon: faArrowRightFromBracket },
    { label: 'Achat', icon: faCartShopping },
    { label: 'Compte', icon: faArrowRightArrowLeft },
  ]

  $: tabIndex = $params[tabIndexKey] || 3

  $: subscribeId = $params[subscribeKey]
  $: queryResum = useApi<{ subscribeId: string }, SubscribeResum>({
    enabled: !!subscribeId,
    queryKey: ['subscribes/resum', { subscribeId }],
  })
  $: subscribe = $queryResum.data
  $: balance = $queryResum.data?.resum.balance
  $: mainContainerHeight =
    $layout.innerHeight - mainContainer?.offsetTop - ($isMobile ? 6 : 16)

  $afterPageLoad(createUserLoader())

  onMount(() => {
    const unsubscribeSSE = subscribeSSE({
      scan(data) {
        if (templateComponent) {
          templateComponent.selectArticleId(data.value)
        } else {
          cashPlaceholder.openArticleMenu(data.value)
        }
      },
    })

    // Ecoute les racourcis claviers
    document.addEventListener('keyup', handleShortcut)
    return () => {
      document.removeEventListener('keyup', handleShortcut)
      unsubscribeSSE()
    }
  })

  function createUserLoader() {
    let subscribrIdLoaded = ''
    return () => {
      if (!subscribeId) subscribrIdLoaded = ''
      else if (subscribeId !== subscribrIdLoaded) {
        api<{ subscribeId: string }, { name: string }>('/api/users/name', {
          params: { subscribeId },
        }).then((user) => {
          subscribrIdLoaded = subscribeId
          clientSelector.setValue(user.name)
        })
      }
      return true
    }
  }

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
    userId: string
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
<GuestDialog
  bind:this={guestDialog}
  on:success={({ detail: newSubscribe }) => {
    redirectSubscribe(newSubscribe)
    clientSelector.setValue(newSubscribe.name)
  }}
/>

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
        class="primary-text"
        style="height: 40px;"
        on:click={() => guestDialog.open()}
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

        {#key tabIndex}
          <div
            in:fade|locale
            style="
                height: calc(100% - {$isMobile ? '56' : '48'}px);
                overflow-y: auto;
              "
          >
            {#if tabIndex === '0'}
              <Provide bind:this={templateComponent} {subscribeId} />
            {:else if tabIndex === '1'}
              <Recover bind:this={templateComponent} {subscribeId} />
            {:else if tabIndex === '2'}
              <Buy bind:this={templateComponent} {subscribeId} />
            {:else if $isMobile}
              <SubActivityMobile {subscribeId} modeAdmin />
            {:else}
              <SubActivity {subscribeId} modeAdmin />
            {/if}
          </div>
        {/key}
      </div>
    {:else}
      <div in:fade|local class="centered flex-grow-1">
        <CashPlaceholder
          bind:this={cashPlaceholder}
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
