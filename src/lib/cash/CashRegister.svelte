<script lang="ts">
  import { onMount } from 'svelte'
  import { fade, slide } from 'svelte/transition'
  import { params, redirect } from '@roxi/routify'
  import { Button, Tabs, Tab } from 'svelte-materialify/src'
  import { useMutation } from '@sveltestack/svelte-query'
  import {
    faArrowRightArrowLeft,
    faArrowRightFromBracket,
    faArrowRightToBracket,
    faCartShopping,
    faCashRegister,
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

  let clientSelector: MagicSelect
  const subscribeKey = 'client_subscribe_id'
  const tabIndexKey = 'cash_register_tab_index'
  let container: HTMLDivElement
  let paymentDialog: PaymentDialog
  let subscribe: SubscribeLookup | undefined = undefined

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

  $: queryResum = useApi<{ subscribeId: string }, SubscribeResum>({
    enabled: !!$params[subscribeKey],
    queryKey: ['subscribes/resum', { subscribeId: $params[subscribeKey] }],
  })
  $: subscribe = $queryResum.data
  $: balance = $queryResum.data?.resum.balance

  onMount(() => {
    if ($params[subscribeKey]) {
      api<{ subscribeId: string }, { name: string }>('/api/users/name', {
        params: { subscribeId: $params[subscribeKey] },
      }).then((user) => clientSelector.setValue(user.name))
    }

    document.addEventListener('keyup', handleShortcut)
    return () => {
      document.removeEventListener('keyup', handleShortcut)
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
    guest?: boolean
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
        data: { ...data, guest: true },
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
  <div class="main-container">
    <div class="d-flex flex-wrap align-center pb-2" style="gap: 0.5em;">
      <div class:flex-grow-1={$isMobile}>
        <MagicSelect
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
          placeholder="Chercher un client"
        />
      </div>

      {#if $isMobile}
        <div class="flex-grow-1" />
        <IconLink
          disabled={$createSubscribeGuest.isLoading}
          clickable
          icon={faUserPlus}
          size="0.8em"
          buttonClass="primary-color"
          on:click={() =>
            $createSubscribeGuest.mutate({ trocId: $params.trocId })}
        />
      {:else}
        <Button
          outlined
          disabled={$createSubscribeGuest.isLoading}
          class="primary-text"
          style="height: 40px;"
          on:click={() =>
            $createSubscribeGuest.mutate({ trocId: $params.trocId })}
        >
          <IconLink icon={faUserPlus} class="mr-2" size="1.2em" />
          Nouveau client
        </Button>
      {/if}

      {#if !$isMobile}
        <div class="flex-grow-1" />
      {/if}

      {#if $params[subscribeKey] && balance && Math.abs(balance) > 0.001}
        <div transition:slide style={$isMobile ? 'width: 100%;' : ''}>
          <Button block class="secondary-color" on:click={openPaymentDialog}>
            Règler {renderAmount(balance, $troc.currency)} en faveur du
            {balance > 0 ? 'client' : 'troc'}
          </Button>
        </div>
      {/if}
    </div>

    {#if $params[subscribeKey]}
      <div
        in:fade|local
        bind:this={container}
        class="simple-card"
        style="min-height: {$layout.innerHeight -
          container?.offsetTop -
          ($isMobile ? 6 : 16)}px;"
      >
        <Tabs
          grow
          icons={$isMobile}
          value={$params[tabIndexKey] || 3}
          on:change={handleChangeTab}
        >
          <div slot="tabs">
            {#each TABS as { ref, label, icon }}
              <Tab class="rounded">
                {#if $isMobile || true}
                  <IconLink
                    {icon}
                    class={$isMobile ? '' : 'mr-3'}
                    size="1.2em"
                  />
                {/if}
                <span style={$isMobile ? 'font-size: 0.8em;' : ''}>{label}</span
                >
              </Tab>
            {/each}
          </div>
        </Tabs>

        {#each TABS as { component }, index}
          {#if index == ($params[tabIndexKey] || 3)}
            <div in:fade|locale class:pa-2={$isMobile} class:pa-4={!$isMobile}>
              <svelte:component
                this={component}
                subscribeId={$params[subscribeKey]}
                modeAdmin
              />
            </div>
          {/if}
        {/each}
      </div>
    {:else}
      <div
        in:fade|local
        bind:this={container}
        class="mt-4 centered"
        style="min-height: {$layout.innerHeight - container?.offsetTop - 16}px;"
      >
        <div>
          <IconLink icon={faCashRegister} size="3.5em" style="opacity: 0.2;" />
        </div>
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
  }
</style>
