<script lang="ts">
  import { onMount } from 'svelte'
  import { fade } from 'svelte/transition'
  import { params, redirect } from '@roxi/routify'
  import { faUserAlt, faUserSecret } from '@fortawesome/free-solid-svg-icons'
  import MagicSelect from '$lib/util/MagicSelect.svelte'
  import { api } from '$lib/api'
  import { Button, Tabs, Tab, TabContent } from 'svelte-materialify'
  import IconLink from '$lib/util/IconLink.svelte'
  import { troc } from '$lib/troc/store'
  import { layout } from '$lib/store/layout'

  import Provide from '$lib/cash/Provide.svelte'
  import Recover from '$lib/cash/Recover.svelte'
  import Buy from '$lib/cash/Buy.svelte'
  import UserResum from '$lib/troc/UserResum.svelte'

  let clientSelector: MagicSelect
  const clientKey = 'client_subscribe_id'
  const tabIndexKey = 'cash_register_tab_index'
  let container: HTMLDivElement

  const TABS = [
    { ref: 'provide', label: 'Fourni', component: Provide },
    { ref: 'recover', label: 'Récupère', component: Recover },
    { ref: 'buy', label: 'Achète', component: Buy },
    { ref: 'resum', label: 'Compte', component: UserResum },
  ]

  onMount(() => {
    if ($params[clientKey]) {
      api<{ subscribeId: string }, { name: string }>('/api/users/name', {
        params: { subscribeId: $params[clientKey] },
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

  function handleChangeTab(event: { detail: number }) {
    const queryParams = $params
    queryParams[tabIndexKey] = event.detail
    $redirect('', queryParams)
  }

  $: console.log($params[tabIndexKey])
</script>

<div class="main-container">
  <div class="d-flex">
    <div style="width: 300px;">
      <MagicSelect
        bind:this={clientSelector}
        path="/subscribes"
        searchKey="q"
        selectKey={clientKey}
        queryParams={{ trocId: $troc._id, includSGlobalUser: true }}
        getValue={(sub) => sub.user.name}
        getValue2={(sub) => sub.user.mail}
        getKey={(sub) => sub._id}
        icon={faUserAlt}
        solo
        keepValue
        dense
        placeholder="Chercher un client"
      />
    </div>

    <div class="ml-4 mt-2">
      <Button depressed style="height: 40px;">
        <IconLink icon={faUserSecret} opacity class="mr-2" size="1.2em" />
        Nouveau client anonyme
      </Button>
    </div>
  </div>
  {#if $params[clientKey]}
    <div
      in:fade|local
      bind:this={container}
      class="simple-card mt-4"
      style="min-height: {$layout.innerHeight - container?.offsetTop - 16}px;"
    >
      <Tabs grow value={$params[tabIndexKey]} on:change={handleChangeTab}>
        <div slot="tabs">
          {#each TABS as { ref, label }}
            <Tab class="rounded">{label}</Tab>
          {/each}
        </div>

        {#each TABS as { component }}
          <TabContent class="pl-4 pr-4">
            <svelte:component
              this={component}
              subscribeId={$params[clientKey]}
            />
          </TabContent>
        {/each}
      </Tabs>
    </div>
  {/if}
</div>

<style>
  :global(.s-tabs) {
    border-radius: 5px;
  }

  .main-container {
    max-width: 1100px;
    margin: auto;
  }
</style>
