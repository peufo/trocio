<script lang="ts">
  import { onMount } from 'svelte'
  import { params } from '@roxi/routify'
  import { faUserAlt } from '@fortawesome/free-solid-svg-icons'
  import MagicSelect from '$lib/util/MagicSelect.svelte'
  import { api } from '$lib/api'

  let clientSelector: MagicSelect

  const clientKey = 'clientSubscribeId'

  onMount(() => {
    if ($params[clientKey]) {
      api('/api/')
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
      getValue={(sub) => sub.user.name}
      getValue2={(sub) => sub.user.mail}
      icon={faUserAlt}
      solo
      keepValue
      placeholder="Chercher un client"
    />
  </div>
</div>
