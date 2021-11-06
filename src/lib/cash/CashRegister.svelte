<script lang="ts">
  import { onMount } from 'svelte'
  import { params } from '@roxi/routify'
  import {
    faUserAlt,
    faUserNinja,
    faUserPlus,
    faUserSecret,
  } from '@fortawesome/free-solid-svg-icons'
  import MagicSelect from '$lib/util/MagicSelect.svelte'
  import { api } from '$lib/api'
  import { Button } from 'svelte-materialify'
  import IconLink from '$lib/util/IconLink.svelte'
  import { troc } from '$lib/troc/store'

  let clientSelector: MagicSelect
  const clientKey = 'clientSubId'

  onMount(() => {
    if ($params[clientKey]) {
      api<{ userId: string }, { name: string }>('/api/users/name', {
        params: { userId: $params[clientKey] },
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
</script>

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
      getKey={(sub) => sub.userId}
      icon={faUserAlt}
      solo
      keepValue
      placeholder="Chercher un client"
    />
  </div>

  <div class="ml-4 mt-2">
    <Button depressed style="height: 40px;">
      <IconLink icon={faUserSecret} opacity class="mr-2" size="1.2em" />
      Client anonyme
    </Button>
  </div>

  <div class="ml-4 mt-2">
    <Button depressed style="height: 40px;">
      <IconLink icon={faUserPlus} opacity class="mr-2" size="1.2em" />
      Nouveau client
    </Button>
  </div>
</div>
