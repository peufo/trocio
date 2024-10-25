<script lang="ts">
  import { params, goto, url } from '@roxi/routify'
  import { mdiLanConnect } from '@mdi/js'

  import Scanner from '$lib/scanner/Scanner.svelte'
  import { Icon } from '$material'
  import { emit } from '$lib/sse'
  import { user } from '$lib/user/store'

  function handleScan(event: { detail: string }) {
    emit('scan', { value: event.detail })
  }

  if (!$user) $goto('/login', { callback: $url(undefined, $params) })
</script>

<div class="wrapper">
  <Scanner isClosable={false} on:detect={handleScan} />

  <div class="text-center mt-12">
    <div>
      <Icon path={mdiLanConnect} class="green-text mb-4" size="60" />
      <br />
      Vous pouvez scanner des étiquettes
    </div>
  </div>
</div>

<style>
  .wrapper {
    padding: 0.5em;
    max-width: 600px;
    margin: auto;
  }
</style>
