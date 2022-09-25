<script lang="ts">
  import { onMount } from 'svelte'
  import { fade } from 'svelte/transition'
  import { params, redirect } from '@roxi/routify'
  import { Button, Tabs, Tab } from 'svelte-materialify'
  import { useMutation } from '@sveltestack/svelte-query'
  import {
    faCashRegister,
    faUserAlt,
    faUserPlus,
  } from '@fortawesome/free-solid-svg-icons'

  import type { ISubscribe } from 'types'
  import { api } from '$lib/api'
  import { troc } from '$lib/troc/store'
  import { layout } from '$lib/store/layout'
  import MagicSelect from '$lib/util/MagicSelect.svelte'
  import IconLink from '$lib/util/IconLink.svelte'
  import Provide from '$lib/cash/Provide.svelte'
  import Recover from '$lib/cash/Recover.svelte'
  import Buy from '$lib/cash/Buy.svelte'
  import SubActivity from '$lib/sub/Activity.svelte'
  import Loader from '$lib/util/Loader.svelte'

  let clientSelector: MagicSelect
  const subscribeKey = 'client_subscribe_id'
  const tabIndexKey = 'cash_register_tab_index'
  let container: HTMLDivElement

  const TABS = [
    { ref: 'provide', label: 'Proposition', component: Provide },
    { ref: 'recover', label: 'Récupèration', component: Recover },
    { ref: 'buy', label: 'Achat', component: Buy },
    { ref: 'resum', label: 'Compte', component: SubActivity },
  ]

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
    if (!event.ctrlKey) return
    console.log(event.key)
    switch (event.key) {
      case 'Backspace':
        clientSelector.focus()
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

  /** Créer un client anonym */
  const createSubscribeAnonym = useMutation(
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
</script>

{#if $troc}
  <div class="main-container">
    <div class="d-flex align-center" style="gap: 1em;">
      <div style="width: 300px;">
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

      {#if $createSubscribeAnonym.isLoading}
        <Button depressed disabled style="height: 40px;">
          <Loader />
        </Button>
      {:else}
        <Button
          depressed
          style="height: 40px;"
          on:click={() =>
            $createSubscribeAnonym.mutate({ trocId: $params.trocId })}
        >
          <IconLink icon={faUserPlus} opacity class="mr-2" size="1.2em" />
          Nouveau client
        </Button>
      {/if}
    </div>
    {#if $params[subscribeKey]}
      <div
        in:fade|local
        bind:this={container}
        class="simple-card mt-4"
        style="min-height: {$layout.innerHeight - container?.offsetTop - 16}px;"
      >
        <Tabs
          grow
          value={$params[tabIndexKey] || 3}
          on:change={handleChangeTab}
        >
          <div slot="tabs">
            {#each TABS as { ref, label }}
              <Tab class="rounded">{label}</Tab>
            {/each}
          </div>
        </Tabs>

        {#each TABS as { component }, index}
          {#if index == ($params[tabIndexKey] || 3)}
            <div in:fade|locale class="pa-4">
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

<style>
  :global(.s-tabs) {
    border-radius: 5px;
  }

  .main-container {
    max-width: 1100px;
    margin: auto;
  }
</style>
